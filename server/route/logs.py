import asyncio
import logging
import os
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, Request, Response, WebSocket
from inotify_simple import INotify, flags

from server.utils.jwt import auth_required


logger = logging.getLogger(__name__)
log_router = APIRouter()
ws_router = APIRouter()


WORKDIR = os.environ.get('WORKDIR', '/app/data')
LOG_FILE = f"{WORKDIR}/logs/app.log"


@log_router.get("/get_log")
async def get_log(request: Request, auth: dict = Depends(auth_required)):
    file_path = LOG_FILE

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")

    file_size = os.path.getsize(file_path)
    range_header = request.headers.get('Range')
    if range_header:
        range_header = range_header.strip().lower()
        if range_header.startswith('bytes='):
            range_header = range_header[6:]
            start, end = range_header.split('-')
            start = int(start) if start else 0
            end = int(end) if end else file_size - 1
            if start >= file_size or end >= file_size:
                raise HTTPException(status_code=416, detail="请求的范围无法满足")

            length = end - start + 1
            headers = {
                'Content-Range': f'bytes {start}-{end}/{file_size}',
                'Accept-Ranges': 'bytes',
                'Content-Length': str(length),
                'Content-Disposition': 'inline'
            }

            async with aiofiles.open(file_path, 'rb') as f:
                await f.seek(start)
                content = await f.read(length)
            return Response(content, status_code=206, headers=headers, media_type='text/plain')

    headers = {
        'Content-Length': str(file_size),
        'Content-Disposition': 'inline'
    }
    async with aiofiles.open(file_path, 'rb') as f:
        content = await f.read()
    return Response(content, headers=headers, media_type='text/plain')


@ws_router.websocket("/log_updates")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("日志 WebSocket 连接已建立。")

    inotify = INotify()
    watch_flags = flags.MODIFY
    wd = inotify.add_watch(LOG_FILE, watch_flags)

    try:
        while True:
            for event in inotify.read(timeout=1000):
                if event.mask & flags.MODIFY:
                    await websocket.send_text("日志已更新。")
            await asyncio.sleep(1)
    except Exception as e:
        logger.error(f"Error in WebSocket connection: {e}")
    finally:
        inotify.rm_watch(wd)
        await websocket.close()
