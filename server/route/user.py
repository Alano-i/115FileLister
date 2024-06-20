import logging
import os
from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
from server.binderapi import ServerConf, UsersConf
from server.common.response import data_to_json
from pydantic import BaseModel
import inject
from datetime import datetime, timedelta
from typing import Optional
from server.utils.jwt import ACCESS_TOKEN_EXPIRE_MINUTES, auth_required, create_access_token


logger = logging.getLogger(__name__)
user_router = APIRouter()


WORKDIR = os.environ.get('WORKDIR', '/app/data')
MAX_LOGIN_ATTEMPTS = 8
FREEZE_DURATION = 30


# 定义一个Pydantic模型来解析和验证请求体
class RequestData(BaseModel):
    album_id: str = ""
    remove: bool = False
    book_title: str = ""
    author: str = ""
    reader: str = ""
    cover_url: str = ""
    ep_start: int = 1
    # downloaded_path_base: str = ""
    audio_start: int = 0
    audio_end: int = 0
    index_on: bool = False
    index_offset: int = 0
    src_base_path_book: str = "",
    src_base_path_music: str = "",
    downloads_path: str = ''                      # 下载文件夹
    update_podcast_switch: bool = False            # 同步xmly开关
    notify_switch: bool = False            # 通知开关
    cron_expression: str = '5 8-23 * * *'         # 定时任务
    server_url: str = ''                               # 外网域名
    magic: str = ''                                    # 魔法
    mbot_download_api: str = ''                        # Mbot下载API
    channel: str = 'qywx'                              # 通知渠道
    pic_url: str = ''                                  # 默认推送图
    qywx_base_url: str = 'https://qyapi.weixin.qq.com'  # 企业微信api地址，需要代理填代理地址即可
    corpid: str = ''
    corpsecret: str = ''
    agentid: str = ''
    touser: str = '@all'
    bark_url: str = ''
    bark_sound: str = 'chime'
    bark_group: str = 'PodSuite'
    bark_icon: str = ''  # icon
    tg_base_url: str = 'https://api.telegram.org/bot'
    tgbot_token: str = ''
    tg_chat_id: str = ''
    tg_proxy: str = ''
    username: str = 'admin'
    password: str = 'admin'
    proxy: str = ''
    theme: str = 'dark'
    input_dirs: str = ''
    output_dir: str = ''
    series: str = ''
    cliped_folder: str = ''
    clip_configs: str = ''
    use_filename: bool = True
    make_podcast: bool = True
    force: bool = True
    year: str = ''
    auto_path: str = ''
    albums: str = ''
    art_album: str = ''
    subject: str = ''
    podcast_summary: str = ''
    podcast_category: str = ''
    is_book_config: str = ''
    audio_paths: str = ''
    move_out_configs: str = ''
    album: str = ''
    is_group: bool = True
    short_filename: bool = True
    deep: bool = False
    cut: bool = True
    diy_cover: bool = True


@user_router .get("/users/me")
async def read_users_me(auth: dict = Depends(auth_required)):
    # auth 字典包含了用户名，根据用户名查询用户信息
    username = auth.get("username", '')
    users_config = inject.instance(UsersConf)
    # 使用列表推导式和 hasattr 检查来获取具有匹配用户名的 Config 对象
    user_info = next((user for user in users_config.users if hasattr(
        user, 'username') and user.username == username), None)
    if user_info:
        # 使用getattr函数来安全地获取属性，如果属性不存在，返回默认值''
        user_info_dict = {
            "username": getattr(user_info, 'username', None),
            "uuid": getattr(user_info, 'uuid', None),
            "is_admin": getattr(user_info, 'is_admin', False),
        }
        return data_to_json(data=user_info_dict)
    else:
        # 如果未找到用户信息，则抛出 HTTP 401 Unauthorized 异常
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户信息未找到或未登录"
        )


locked_users = {}


# 登录接口，使用 POST 方法
@user_router .post("/login")
async def login_for_access_token(data: RequestData, response: Response):
    data_rec = {"用户名": data.username, "密码": data.password}
    logger.info(f'接收到登录信息：{data_rec}')
    if data.username in locked_users and locked_users[data.username]["unlock_time"] is not None and datetime.now() < locked_users[data.username]["unlock_time"]:
        logger.error(f"账号已被锁定，请在 {locked_users[data.username]['unlock_time'].strftime('%Y-%m-%d %H:%M:%S')} 后再试")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"账号已被锁定，请在 {locked_users[data.username]['unlock_time'].strftime('%Y-%m-%d %H:%M:%S')} 后再试",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = authenticate_user(data.username, data.password)
    if not user:
        if data.username in locked_users:
            locked_users[data.username]["attempts"] += 1
            if locked_users[data.username]["attempts"] >= MAX_LOGIN_ATTEMPTS:
                locked_users[data.username]["unlock_time"] = datetime.now(
                ) + timedelta(minutes=FREEZE_DURATION)
                logger.error(f"账号已被锁定，请在 {locked_users[data.username]['unlock_time'].strftime('%Y-%m-%d %H:%M:%S')} 后再试")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"账号已被锁定，请在 {locked_users[data.username]['unlock_time'].strftime('%Y-%m-%d %H:%M:%S')} 后再试",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        else:
            locked_users[data.username] = {"attempts": 1, "unlock_time": None}
        logger.error(
            f'账号或密码错误，还可以尝试 {MAX_LOGIN_ATTEMPTS - locked_users[data.username]["attempts"]} 次')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f'账号或密码错误，还可以尝试 {MAX_LOGIN_ATTEMPTS - locked_users[data.username]["attempts"]} 次',
            headers={"WWW-Authenticate": "Bearer"},
        )
    if data.username in locked_users:
        del locked_users[data.username]

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['username']}, expires_delta=access_token_expires)

    # content = {"success": True, "code": 0, "data": "登录成功！", "message": "OK"}
    # response = JSONResponse(content=content)

    # 使用 data_to_json 函数设置响应内容
    response = data_to_json(message="登录成功！", data={"username": data.username})
    # 设置 Cookie 参数
    cookie_max_age = ACCESS_TOKEN_EXPIRE_MINUTES * 60
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=cookie_max_age,
        path='/',
        secure=False,               # HTTP：False， HTTPS: True
        samesite='Strict'           # 在开发环境中，因为是 HTTP，可以使用 Lax 或 Strict
    )
    # 后端打印响应头
    # logger.info(f"响应头:{response.headers}")
    # config_dict = response.__dict__
    # logger.info(f"config_dict:{config_dict}")
    return response


@user_router .get("/logout")
async def logout(request: Request, response: Response, auth: dict = Depends(auth_required)):
    access_token = request.cookies.get(
        "access_token", "") or request.query_params.get("access_token", "")
    # content = {"success": True, "code": 0, "message": "已退出登录"}
    # response = JSONResponse(content=content)
    # 使用 data_to_json 函数设置响应内容
    response = data_to_json(message="已退出登录！")
    # 设置 Cookie 参数
    cookie_max_age = 0
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=cookie_max_age,
        path='/',
        secure=False,               # HTTP：False， HTTPS: True
        samesite='Strict'           # 开发环境中是 HTTP，可以使用 Lax 或 Strict
    )
    return response


# 认证用户
def authenticate_user(username: str, password: str) -> Optional[dict]:
    # 使用依赖注入获取 ServerConf 实例
    server_config = inject.instance(ServerConf)
    user = server_config.user
    psw = server_config.password
    if username == user and password == psw:
        return {"username": username}
    return None