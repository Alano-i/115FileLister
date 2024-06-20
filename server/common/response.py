import json
import datetime
from fastapi import status
from typing import Union
from fastapi.responses import JSONResponse, Response
from starlette.responses import PlainTextResponse


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        return super().default(obj)


def data_to_json(message: Union[str, None] = '成功', data: Union[bool, list, dict, str, None] = None) -> Response:
    """
    返回http_status=200的结果
    :param message: 消息
    :param data: 返回结果
    :return:
    """
    return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                'success': True,
                'code': 0,
                'message': message,
                'data': data,
            },
        )


def json_200(message: Union[str, None] = None) -> Response:
    """
    返回http_status=200的结果
    :param message: 消息
    :return:
    """
    if not message:
        message = "success"
    return PlainTextResponse(
        media_type="application/json",
        status_code=status.HTTP_200_OK,
        content=json.dumps({
            'success': True,
            'code': 0,
            'message': message,
        }, cls=CustomJSONEncoder),
    )


def json_500(message: Union[str, None] = None) -> Response:
    """
    返回http_status=500的结果
    :param message: 消息
    :return:
    """
    if not message:
        message = "success"
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            'success': False,
            'code': 1,
            'message': message,
        }
    )


def json_with_status(status_code: int, data: Union[bool, list, dict, str, None] = None,
                     message: Union[str, None] = None) -> Response:
    """
    返回自定义statuscode的结果
    :param status_code: 状态码
    :param data: 返回结果
    :param message: 消息
    :return:
    """
    if not message:
        message = "success"
    return JSONResponse(
        status_code=status_code,
        content={
            'success': False,
            'code': 1,
            'message': message,
            'data': data,
        }
    )
