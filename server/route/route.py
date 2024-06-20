import logging
import os
from fastapi import APIRouter, Depends, Request
from fastapi.responses import FileResponse, StreamingResponse
from server.func.functions import *
from server.config.yamlconf import update_conf_file, update_conf
from server.common.response import data_to_json, json_200, json_500
# from server.func.command import audio_clip_m, podcast_m
import inject
from server.binderapi import *
from server.utils.jwt import auth_required
from server.route.user import RequestData, user_router
from server.route.logs import log_router

logger = logging.getLogger(__name__)

main_router = APIRouter()

WORKDIR = os.environ.get('WORKDIR', '/app/data')


@main_router.get("/podcast")
async def podcast(request: Request, auth: dict = Depends(auth_required)):
    file_path = f"{WORKDIR}/podcast.json"
    podcast_data = read_json_file(file_path)

    if podcast_data:
        logger.info(f'播客源信息已返给客户端')
        return data_to_json(message=f'成功获取到播客源列表', data=podcast_data)
    else:
        logger.error(f'未获取到播客源信息')
        return json_500(message=f'未获取到播客源信息')

log_test = logging.getLogger("uvicorn.error")


@main_router.get("/get_sub")
async def get_sub(request: Request, auth: dict = Depends(auth_required)):
    file_path = f"{WORKDIR}/subscribe.json"
    sub_data = read_json_file(file_path)
    if sub_data:
        logger.info(f'有声书订阅信息已返给客户端')
        # 将对象（即字典）转换为数组（即列表）
        data_array = [value for key, value in sub_data.items()]
        return data_to_json(message=f'成功获取订阅列表', data=data_array)

    else:
        logger.error(f'未获取到有声书订阅信息')
        return json_500(message=f'未获取到有声书订阅信息')


@main_router.get("/get_conf")
async def get_conf(request: Request, auth: dict = Depends(auth_required)):
    all_conf = inject.instance(AllConf)
    all_config = all_conf.all_config
    if all_config:
        logger.info(f'配置信息已返给客户端')
        return data_to_json(message=f'成功获取到配置信息', data=all_config)
    else:
        logger.error(f'未获取到配置信息')
        return json_500(message=f'未获取到配置信息')


@main_router.post("/update_conf")
async def update_config(data: RequestData, auth: dict = Depends(auth_required)):  # 直接接收请求体作为参数
    logger.info(f'接收到配置数据：{data}')
    params = {
        "update_flag": True,
        "src_base_path_book": data.src_base_path_book,
        "src_base_path_music": data.src_base_path_music,
        "downloads_path": data.downloads_path,
        "server_url": data.server_url,
        "username": data.username,
        "password": data.password,
        "magic": data.magic,
        "cron_expression": data.cron_expression,
        "update_podcast_switch": data.update_podcast_switch,
        "notify_switch": data.notify_switch,
        "mbot_download_api": data.mbot_download_api,
        "channel": data.channel,
        "pic_url": data.pic_url,
        "qywx_base_url": data.qywx_base_url,
        "corpid": data.corpid,
        "corpsecret": data.corpsecret,
        "agentid": data.agentid,
        "touser": data.touser,
        "bark_url": data.bark_url,
        "bark_sound": data.bark_sound,
        "bark_group": data.bark_group,
        "bark_icon": data.bark_icon,
        "tg_base_url": data.tg_base_url,
        "tgbot_token": data.tgbot_token,
        "tg_chat_id": data.tg_chat_id,
        "proxy": data.proxy,
        "theme": data.theme
    }
    logger.info(f'params:{params}')
    update_conf_file(**params)     # 更新yml配置文件
    update_conf()                  # 重新注入最新的配置
    return json_200(message=f"已更新配置'")


@main_router.post("/sub")
async def subscribe(data: RequestData, auth: dict = Depends(auth_required)):  # 直接接收请求体作为参数
    logger.info(f'接收到请求数据：{data}')

    # 获取请求体中的数据，无需从查询参数中获取
    file_path = f"{WORKDIR}/subscribe.json"
    album_id = data.album_id
    remove = data.remove
    book_title = data.book_title
    author = data.author
    reader = data.reader
    cover_url = data.cover_url
    ep_start = data.ep_start
    # downloaded_path_base = data.downloaded_path_base
    audio_start = data.audio_start
    audio_end = data.audio_end
    index_on = data.index_on
    index_offset = data.index_offset
    reader_xmly = ''
    if not cover_url and album_id:
        cover_url, reader_xmly, book_title_xmly = get_xmly_info(album_id)
        if cover_url:
            logger.info(f'获取到有声书封面：{cover_url}')
    book_title = book_title or book_title_xmly
    reader = reader or reader_xmly
    author = author or '作者未知'
    if update_sub_json(file_path, album_id, remove, cover_url, book_title, author, reader, ep_start, audio_start, audio_end, index_on, index_offset):
        if remove:
            logger.info(f'已经取消「{album_id}」的订阅')
            return json_200(message=f"['{album_id}'] 已取消订阅'")
        else:
            return json_200(message=f"['{album_id}'] 已成功订阅'")
    else:
        return json_500(message=f'「{album_id}」订阅信息信息保存失败，可能是传递参数出错！')


#  剪辑片头片尾，修改整理元数据，制作播客源，一条龙！
@main_router.post("/audio_clip_m")
async def subscribe(data: RequestData, auth: dict = Depends(auth_required)):  # 直接接收请求体作为参数
    logger.info(f'接收到请求数据：{data}')
    audio_clip_m(data)


#  生成 Apple 播客源 URL，只支持有声书、音乐父文件夹下的音频（整理存量无此限制）
@main_router.post("/podcast_m")
async def subscribe(data: RequestData):  # 直接接收请求体作为参数
    logger.info(f'接收到请求数据1：{data}')
    podcast_m(data)


@main_router.get("/update_podcast_all")
async def update_all_podcast(request: Request, auth: dict = Depends(auth_required)):
    sub_data = ''
    if xmly_main(sub_data):
        logger.info(f'同步喜马拉雅并更新播客完成')
        return json_200(message=f'同步喜马拉雅并更新播客完成')
    else:
        logger.error(f'同步喜马拉雅并更新播客失败')
        return json_500(message=f'同步喜马拉雅并更新播客失败')


@main_router.get("/update_podcast")
async def subscribe(data: RequestData, auth: dict = Depends(auth_required)):
    logger.info(f'接收到请求数据：{data}')
    album_id = data.album_id
    book_title = data.book_title
    author = data.author
    reader = data.reader
    # cover_url = data.cover_url
    ep_start = data.ep_start
    # downloaded_path_base = data.downloaded_path_base
    audio_start = data.audio_start
    audio_end = data.audio_end
    index_on = data.index_on
    index_offset = data.index_offset
    sub_data = {
        album_id: {
            "book_title": book_title,
            "author": author,
            "reader": reader,
            "ep_start": ep_start,
            # "downloaded_path_base": downloaded_path_base,
            "album_id": album_id,
            "audio_start": audio_start,
            "audio_end": audio_end,
            "index_on": index_on,
            "index_offset": index_offset
        }
    }
    if xmly_main(sub_data):
        logger.info(f'同步喜马拉雅并更新播客完成')
        return json_200(message=f'同步喜马拉雅并更新播客完成')
    else:
        logger.error(f'同步喜马拉雅并更新播客失败')
        return json_500(message=f'同步喜马拉雅并更新播客失败')


# @router.get("/static/{file_path}")
@main_router.get("/static/podcast/{file_path:path}")
async def static_file(request: Request, file_path: str):
    """
    支持流式播放, 比如音频和视频文件的播放, 需要支持 HTTP 的范围请求 (range requests), 这样客户端可以请求文件的特定部分, 从而实现调整进度和倍速播放等功能。
    在 FastAPI 中, 通过检查请求头中的 Range 字段来实现这个功能。如果存在 Range 头, 你需要解析该头的值, 以确定请求的文件范围, 
    并返回相应的文件片段以及正确的状态码 (206 Partial Content )。如果没有 Range 头, 则可以返回整个文件。
    """
    # file_path_full = os.path.join('./podcast/', file_path)
    file_path_full = os.path.abspath(os.path.join('/podcast', file_path))
    logger.info(f'静态请求：{url_decode(file_path_full)}')
    if not os.path.exists(file_path_full):
        return json_500(message="File not found")
    # 判断所请求文件的扩展名
    file_ext = os.path.splitext(file_path_full)[-1].lower()
    # 设置音频文件的 MIME 类型为 audio/mpeg
    if file_ext in [".mp3", ".mp4", ".m4a", ".flac", ".aac", ".wav", ".ogg"]:
        media_type = "audio/mpeg"
    elif file_ext in [".jpg", ".png", ".jpeg", ".gif", ".bmp", ".webp", ".heif", ".svg", ".tiff", ".tif", ".jpeg"]:
        media_type = "image/" + file_ext[1:]  # 根据扩展名设置对应的图片类型
    elif file_ext == ".xml":
        media_type = "application/xml"
    else:
        media_type = "application/octet-stream"
    range_header = request.headers.get('Range')
    # logger.info(f"request_range:{range_header}")
    if range_header:
        file_size = os.path.getsize(file_path_full)
        range_match = re.search(r'bytes=(\d+)-(\d*)', range_header)
        if range_match:
            start = int(range_match.group(1))
            end = int(range_match.group(2) or file_size - 1)
            length = end - start + 1
            with open(file_path_full, 'rb') as f:
                f.seek(start)
                data = f.read(length)
            headers = {
                'Content-Range': f'bytes {start}-{end}/{file_size}',
                'Accept-Ranges': 'bytes',
                'Content-Length': str(length),
            }
            return StreamingResponse(
                iter([data]),
                media_type=media_type,
                headers=headers,
                status_code=206
            )
    # 如果没有范围请求，返回整个文件
    return FileResponse(file_path_full, media_type=media_type, headers={"Content-Disposition": "inline"})
    # return FileResponse(encoded_file_path, media_type=media_type, headers={"Content-Disposition": "inline"})
    # return FileResponse(file_path, media_type=media_type, headers=headers, status_code=200)
    # return Response(content=file_path, media_type=media_type)


main_router.include_router(user_router, tags=["user"])
main_router.include_router(log_router, tags=["user"])
