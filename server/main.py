#!/usr/bin/env python3
# encoding: utf-8

from apscheduler.triggers.cron import CronTrigger
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from server.models import *
from server.common.response import json_200, json_with_status, json_500
from server.common.logging import LOGGING_CONFIG
from server.binderapi import *
from server.config.yamlconf import update_conf_file, update_conf
from server.databases import create_all
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from fastapi import FastAPI, Request
import inject
import uvicorn
import httpx
import logging.config
import os
from server.route.logs import ws_router

scheduler = BackgroundScheduler(daemon=True)

logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger(__name__)


create_all()


####################################################################################################################

__author__ = "ChenyangGao <https://chenyanggao.github.io>"
__version__ = (0, 0, 1)
__version_str__ = ".".join(map(str, __version__))
__doc__ = """\
    🕸️ 获取你的 115 网盘账号上文件信息和下载链接 🕷️

🚫 注意事项：请求头需要携带 User-Agent。
如果使用 web 的下载接口，则有如下限制：
    - 大于等于 115 MB 时不能下载
    - 不能直接请求直链，需要携带特定的 Cookie 和 User-Agent
"""

from os import environ
cookies = environ.get("cookies")
WORKDIR = os.environ.get('WORKDIR', '/app/data')

cookies_path = f"{WORKDIR}/115-cookies.txt"
lock_dir_methods = environ.get("lock_dir_methods") is not None
path_persistence_commitment = environ.get("path_persistence_commitment") is not None


from asyncio import Lock
from collections.abc import Mapping, MutableMapping
from functools import partial, update_wrapper
from os import stat
from os.path import expanduser, dirname, join as joinpath, realpath
from re import compile as re_compile, MULTILINE
from sys import exc_info
from urllib.parse import quote

from cachetools import LRUCache, TTLCache
from blacksheep import (
    get, text, html, file, redirect, 
    Application, Request, Response, StreamedContent
)
from blacksheep.server.openapi.common import ParameterInfo
from blacksheep.server.openapi.v3 import OpenAPIHandler
from openapidocs.v3 import Info # type: ignore
from httpx import HTTPStatusError
from p115 import P115Client, P115Url, AVAILABLE_APPS

from blacksheep.server.openapi.ui import ReDocUIProvider

CRE_LINE_HEAD_SLASH_sub = re_compile(b"^(?=/)", MULTILINE).sub

cookies_path_mtime = 0
web_cookies = ""
login_lock = Lock()
web_login_lock = Lock()
fs_lock = Lock() if lock_dir_methods else None

if not cookies:
    if cookies_path:
        try:
            cookies = open(cookies_path).read()
        except FileNotFoundError:
            pass
    else:
        seen = set()
        for dir_ in (".", expanduser("~"), dirname(__file__)):
            dir_ = realpath(dir_)
            if dir_ in seen:
                continue
            seen.add(dir_)
            try:
                path = joinpath(dir_, "115-cookies.txt")
                cookies = open(path).read()
                cookies_path_mtime = stat(path).st_mtime_ns
                if cookies:
                    cookies_path = path
                    break
            except FileNotFoundError:
                pass

client = P115Client(cookies, app="qandroid")
if cookies_path and cookies != client.cookies:
    open(cookies_path, "w").write(client.cookies)
try:
    device = client.login_device()["icon"]
except Exception as e:
    logger.error(f"服务启动失败，请在 [/app/data/115-cookies.txt] 中输入有效的 115 cookies")


if device not in AVAILABLE_APPS:
    # 115 浏览器版
    if device == "desktop":
        device = "web"
    else:
        warn(f"encountered an unsupported app {device!r}, fall back to 'qandroid'")
        device = "qandroid"
fs = client.get_fs(client, path_to_id=LRUCache(65536))
# NOTE: id 到 pickcode 的映射
id_to_pickcode: MutableMapping[int, str] = LRUCache(65536)
# NOTE: 有些播放器，例如 IINA，拖动进度条后，可能会有连续 2 次请求下载链接，而后台请求一次链接大约需要 170-200 ms，因此弄个 0.3 秒的缓存
url_cache: MutableMapping[tuple[str, str], P115Url] = TTLCache(64, ttl=0.3)


app = Application()
# 提供静态文件服务：https://www.neoteroi.dev/blacksheep/static-files/
app.serve_files("./frontend")

# logger = getattr(app, "logger")
docs = OpenAPIHandler(info=Info(
    title="115 Filelist WEB API Docs", 
    version=__version_str__, 
))
docs.ui_providers.append(ReDocUIProvider())
docs.bind_app(app)


def format_bytes(
    n: int, 
    /, 
    unit: str = "", 
    precision: int = 2, 
) -> str:
    "scale bytes to its proper byte format"
    if unit == "B" or not unit and n < 1024:
        return f"{n} B"
    b = 1
    b2 = 1024
    for u in ["K", "M", "G", "T", "P", "E", "Z", "Y"]:
        b, b2 = b2, b2 << 10
        if u == unit if unit else n < b2:
            break
    return f"%.{precision}f {u}B" % (n / b)


async def relogin(exc=None):
    global cookies_path_mtime
    if exc is None:
        exc = exc_info()[0]
    mtime = cookies_path_mtime
    async with login_lock:
        need_update = mtime == cookies_path_mtime
        if cookies_path and need_update:
            try:
                mtime = stat(cookies_path).st_mtime_ns
                if mtime != cookies_path_mtime:
                    client.cookies = open(cookies_path).read()
                    cookies_path_mtime = mtime
                    need_update = False
            except FileNotFoundError:
                logger.error("🦾 文件空缺")
        if need_update:
            if exc is None:
                logger.error("🦾 重新扫码")
            else:
                logger.error("""{prompt}一个 Web API 受限 (响应 "405: Not Allowed"), 将自动扫码登录同一设备\n{exc}""".format(
                    prompt = "🤖 重新扫码：", 
                    exc    = f"    ├ \x1b[31m{type(exc).__module__}.{type(exc).__qualname__}{exc}")
                )
            await client.login_another_app(
                device, 
                replace=True, 
                timeout=5, 
                async_=True, 
            )
            if cookies_path:
                open(cookies_path, "w").write(client.cookies)
                cookies_path_mtime = stat(cookies_path).st_mtime_ns


async def call_wrap(func, /, *args, **kwds):
    kwds["async_"] = True
    try:
        if fs_lock is None:
            return await func(*args, **kwds)
        else:
            async with fs_lock:
                return await func(*args, **kwds)
    except HTTPStatusError as e:
        if e.response.status_code != 405:
            raise
        await relogin(e)
    return await call_wrap(func, *args, **kwds)


def normalize_attr(
    attr: Mapping, 
    origin: str = "", 
) -> dict:
    KEYS = (
        "id", "parent_id", "name", "path", "pickcode", "is_directory", "sha1", 
        "size", "ico", "ctime", "mtime", "atime", "thumb", "star", "labels", 
        "score", "hidden", "described", "violated", "ancestors", 
    )
    data = {k: attr[k] for k in KEYS if k in attr}
    data["id"] = str(data["id"])
    data["parent_id"] = str(data["parent_id"])
    for info in data["ancestors"]:
        info["id"] = str(info["id"])
        info["parent_id"] = str(info["parent_id"])
    if not attr["is_directory"]:
        pickcode = attr["pickcode"]
        url = f"{origin}/api/download{quote(attr['path'], safe=':/')}?pickcode={pickcode}"
        short_url = f"{origin}/api/download?pickcode={pickcode}"
        if attr["violated"] and attr["size"] < 1024 * 1024 * 115:
            url += "&web=true"
            short_url += "&web=true"
        data["format_size"] = format_bytes(attr["size"])
        data["url"] = url
        data["short_url"] = short_url
    return data


def redirect_exception_response(func, /):
    async def wrapper(*args, **kwds):
        try:
            return await func(*args, **kwds)
        except HTTPStatusError as e:
            return text(
                f"{type(e).__module__}.{type(e).__qualname__}: {e}", 
                e.response.status_code, 
            )
        except FileNotFoundError as e:
            return text(str(e), 404)
        except OSError as e:
            return text(str(e), 500)
        except Exception as e:
            return text(str(e), 503)
    return update_wrapper(wrapper, func)


@docs(responses={
    200: "返回对应文件或目录的信息", 
    404: "文件或目录不存在", 
    500: "服务器错误"
})
@get("/api/attr")
@get("/api/attr/{path:path2}")
@redirect_exception_response
async def get_attr(
    request: Request, 
    pickcode: str = "", 
    id: int = -1, 
    path: str = "", 
    path2: str = "", 
):
    """获取文件或目录的属性

    :param pickcode: 文件或目录的 pickcode，优先级高于 id
    :param id: 文件或目录的 id，优先级高于 path
    :param path: 文件或目录的路径，优先级高于 path2
    :param path2: 文件或目录的路径，这个直接在接口路径之后，不在查询字符串中
    """
    if pickcode:
        id = await call_wrap(fs.get_id_from_pickcode, pickcode)
    attr = await call_wrap(fs.attr, (path or path2) if id < 0 else id)
    origin = f"{request.scheme}://{request.host}"
    return normalize_attr(attr, origin)


@docs(responses={
    200: "罗列对应目录", 
    404: "文件或目录不存在", 
    500: "服务器错误"
})
@get("/api/list")
@get("/api/list/{path:path2}")
@redirect_exception_response
async def get_list(
    request: Request, 
    pickcode: str = "", 
    id: int = -1, 
    path: str = "", 
    path2: str = "", 
):
    """罗列归属于此目录的所有文件和目录属性

    :param pickcode: 文件或目录的 pickcode，优先级高于 id
    :param id: 文件或目录的 id，优先级高于 path
    :param path: 文件或目录的路径，优先级高于 path2
    :param path2: 文件或目录的路径，这个直接在接口路径之后，不在查询字符串中
    """
    if pickcode:
        id = await call_wrap(fs.get_id_from_pickcode, pickcode)
    children = await call_wrap(fs.listdir_attr, (path or path2) if id < 0 else id)
    origin = f"{request.scheme}://{request.host}"
    return [
        normalize_attr(attr, origin)
        for attr in children
    ]


@docs(responses={
    200: "返回对应文件或目录的祖先节点列表（包含自己）", 
    404: "文件或目录不存在", 
    500: "服务器错误"
})
@get("/api/ancestors")
@get("/api/ancestors/{path:path2}")
@redirect_exception_response
async def get_ancestors(
    pickcode: str = "", 
    id: int = -1, 
    path: str = "", 
    path2: str = "", 
):
    """获取祖先节点

    :param pickcode: 文件或目录的 pickcode，优先级高于 id
    :param id: 文件或目录的 id，优先级高于 path
    :param path: 文件或目录的路径，优先级高于 path2
    :param path2: 文件或目录的路径，这个直接在接口路径之后，不在查询字符串中
    """
    if pickcode:
        id = await call_wrap(fs.get_id_from_pickcode, pickcode)
    return await call_wrap(fs.get_ancestors, (path or path2) if id < 0 else id)


@docs(responses={
    200: "返回对应文件或目录的备注", 
    404: "文件或目录不存在", 
    500: "服务器错误"
})
@get("/api/desc")
@get("/api/desc/{path:path2}")
@redirect_exception_response
async def get_desc(
    pickcode: str = "", 
    id: int = -1, 
    path: str = "", 
    path2: str = "", 
):
    """获取备注

    :param pickcode: 文件或目录的 pickcode，优先级高于 id
    :param id: 文件或目录的 id，优先级高于 path
    :param path: 文件或目录的路径，优先级高于 path2
    :param path2: 文件或目录的路径，这个直接在接口路径之后，不在查询字符串中
    """
    if pickcode:
        id = await call_wrap(fs.get_id_from_pickcode, pickcode)
    return html(await call_wrap(fs.desc, (path or path2) if id < 0 else id))


@docs(responses={
    200: "返回对应文件的下载链接", 
    404: "文件或目录不存在", 
    500: "服务器错误"
})
@get("/api/url")
@get("/api/url/{path:path2}")
@redirect_exception_response
async def get_url(
    request: Request, 
    pickcode: str = "", 
    id: int = -1, 
    path: str = "", 
    path2: str = "", 
    web: bool = False, 
):
    """获取下载链接

    :param pickcode: 文件或目录的 pickcode，优先级高于 id
    :param id: 文件或目录的 id，优先级高于 path
    :param path: 文件或目录的路径，优先级高于 path2
    :param path2: 文件或目录的路径，这个直接在接口路径之后，不在查询字符串中
    :param web: 是否使用 web 接口获取下载链接。如果文件被封禁，但小于 115 MB，启用此选项可成功下载文件
    """
    user_agent = (request.get_first_header(b"User-agent") or b"").decode("utf-8")
    if not pickcode:
        pickcode = await call_wrap(fs.get_pickcode, (path or path2) if id < 0 else id)
    try:
        url = url_cache[(pickcode, user_agent)]
    except KeyError:
        url = url_cache[(pickcode, user_agent)] = await call_wrap(
            fs.get_url_from_pickcode, 
            pickcode, 
            headers={"User-Agent": user_agent}, 
            use_web_api=web, 
        )
    return {"url": url, "headers": url["headers"]}


@docs(responses={
    200: "下载对应文件", 
    404: "文件或目录不存在", 
    500: "服务器错误"
})
@get("/api/download")
@get("/api/download/{path:path2}")
@redirect_exception_response
async def file_download(
    request: Request, 
    pickcode: str = "", 
    id: int = -1, 
    path: str = "", 
    path2: str = "", 
    web: bool = False, 
):
    """下载文件

    :param pickcode: 文件或目录的 pickcode，优先级高于 id
    :param id: 文件或目录的 id，优先级高于 path
    :param path: 文件或目录的路径，优先级高于 path2
    :param path2: 文件或目录的路径，这个直接在接口路径之后，不在查询字符串中
    :param web: 是否使用 web 接口获取下载链接。如果文件被封禁，但小于 115 MB，启用此选项可成功下载文件
    """
    resp = await get_url.__wrapped__(request, pickcode, id, path, path2, web=web)
    url = resp["url"]
    headers = resp["headers"]
    if web:
        bytes_range = request.get_first_header(b"Range")
        if bytes_range:
            headers["Range"] = bytes_range.decode("utf-8")
            stream = await client.request(url, headers=headers, parse=None, async_=True)
            return Response(
                206, 
                headers=[(k.encode("utf-8"), v.encode("utf-8")) for k, v in stream.headers.items()], 
                content=StreamedContent(
                    (stream.headers.get("Content-Type") or "application/octet-stream").encode("utf-8"), 
                    partial(stream.aiter_bytes, 1 << 16), 
                ), 
            )
        stream = await client.request(url, headers=headers, parse=None, async_=True)
        return file(
            partial(stream.aiter_bytes, 1 << 16), 
            content_type=stream.headers.get("Content-Type") or "application/octet-stream", 
            file_name=url["file_name"], 
        )
    return redirect(url)


@docs(responses={
    200: "返回对应文件的 m3u8 文件", 
    404: "文件或目录不存在", 
    500: "服务器错误"
})
@get("/api/m3u8")
@get("/api/m3u8/{path:path2}")
@redirect_exception_response
async def file_m3u8(
    request: Request, 
    pickcode: str = "", 
    id: int = -1, 
    path: str = "", 
    path2: str = "", 
    definition: int = 4, 
):
    """获取音视频的 m3u8 文件

    :param pickcode: 文件或目录的 pickcode，优先级高于 id
    :param id: 文件或目录的 id，优先级高于 path
    :param path: 文件或目录的路径，优先级高于 path2
    :param path2: 文件或目录的路径，这个直接在接口路径之后，不在查询字符串中
    :param definition: 分辨率。<br />&nbsp;&nbsp;3 - HD<br />&nbsp;&nbsp;4 - UD
    """
    global web_cookies
    user_agent = (request.get_first_header(b"User-agent") or b"").decode("utf-8")
    if not pickcode:
        pickcode = await call_wrap(fs.get_pickcode, (path or path2) if id < 0 else id)
    url = f"http://115.com/api/video/m3u8/{pickcode}.m3u8?definition={definition}"
    async with web_login_lock:
        if not web_cookies:
            if device == "web":
                web_cookies = client.cookies
            else:
                web_cookies = (await client.login_another_app("web", async_=True)).cookies
    while True:
        try:
            data = await client.request(
                url, 
                headers={"User-Agent": user_agent, "Cookie": web_cookies}, 
                parse=False, 
                async_=True, 
            )
            break
        except HTTPStatusError as e:
            if e.response.status_code != 405:
                raise
            async with web_login_lock:
                web_cookies = (await client.login_another_app("web", replace=device=="web", async_=True)).cookies
    if not data:
        raise FileNotFoundError("404: file not found")
    url = data.split()[-1].decode("ascii")
    data = await client.request(
        url, 
        headers={"User-Agent": user_agent}, 
        parse=False, 
        async_=True, 
    )
    return file(
        CRE_LINE_HEAD_SLASH_sub(b"https://cpats01.115.com", data), 
        content_type="application/x-mpegurl", 
        file_name=f"{pickcode}.m3u8", 
    )
####################################################################################################################




def echo_author():
    docker_version = os.environ.get("VERSION")
    logger.info("""开始启动
                
 ██╗ ██╗███████╗    ███████╗██╗██╗     ███████╗    ██╗     ██╗███████╗████████╗███████╗██████╗ 
███║███║██╔════╝    ██╔════╝██║██║     ██╔════╝    ██║     ██║██╔════╝╚══██╔══╝██╔════╝██╔══██╗
╚██║╚██║███████╗    █████╗  ██║██║     █████╗      ██║     ██║███████╗   ██║   █████╗  ██████╔╝
 ██║ ██║╚════██║    ██╔══╝  ██║██║     ██╔══╝      ██║     ██║╚════██║   ██║   ██╔══╝  ██╔══██╗
 ██║ ██║███████║    ██║     ██║███████╗███████╗    ███████╗██║███████║   ██║   ███████╗██║  ██║
 ╚═╝ ╚═╝╚══════╝    ╚═╝     ╚═╝╚══════╝╚══════╝    ╚══════╝╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
                """)
    logger.info(f"Version: {docker_version}")

def startup():
    echo_author()
    update_conf_file()
    update_conf()
    logger.info(f'程序启动成功')

def main():
    os.environ["VERSION"] = "V0.1.0"
    startup()
    uvicorn.run(app, host="0.0.0.0", port=9115, reload=False)

if __name__ == '__main__':
    main()
