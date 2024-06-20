import httpx
import inject
import logging
import datetime
import os
import json

from tenacity import retry, stop_after_attempt, wait_random_exponential
from cacheout import Cache

from server.binderapi import QywxConf

logger = logging.getLogger(__name__)
token_cache = Cache(maxsize=1000)
APP_USER_AGENT = f"Alano/PodSuite: {os.environ.get('VERSION')}"


class QYWXNotify:
    def __init__(self):
        qywx_conf: QywxConf = inject.instance(QywxConf)
        self.base_url = qywx_conf.base_url.strip('/')
        self.corp_id = qywx_conf.corp_id
        self.corp_secret = qywx_conf.corp_secret
        self.agent_id = qywx_conf.agent_id
        self.to_user = qywx_conf.to_user
        self.token_cache = token_cache.get('access_token')
        self.token_expires_time = token_cache.get('expires_time')

    @retry(wait=wait_random_exponential(min=1, max=20), stop=stop_after_attempt(3))
    def get_access_token(self):
        if not self.corp_id or not self.corp_secret or not self.agent_id or not self.to_user:
            logger.error("企业微信未正确配置，请检查你的 corp_id 和 corp_secret 等配置")
            return
        if self.token_expires_time is not None and self.token_expires_time >= datetime.datetime.now():
            return self.token_cache
        res = httpx.get(
            f'{self.base_url}/cgi-bin/gettoken?corpid={self.corp_id}&corpsecret={self.corp_secret}', headers={
                'user-agent': APP_USER_AGENT
            })
        j = res.json()
        if j['errcode'] == 0:
            self.token_expires_time = datetime.datetime.now() + datetime.timedelta(seconds=j['expires_in'] - 500)
            self.token_cache = j['access_token']
            token_cache.set('access_token', self.token_cache, ttl=j['expires_in'] - 500)
            token_cache.set('expires_time', self.token_expires_time, ttl=j['expires_in'] - 500)
            return self.token_cache
        else:
            return None

    @retry(wait=wait_random_exponential(min=1, max=20), stop=stop_after_attempt(3))
    def __do_send_message__(self, access_token, data):
        url = f'{self.base_url}/cgi-bin/message/send?access_token={access_token}'
        res = httpx.post(url, data=data, headers={
            'user-agent': APP_USER_AGENT
        })
        return res.json()

    def send_text_message(self, text_message):
        access_token = self.get_access_token()
        if access_token is None:
            logger.error("获取企业微信 access_token 失败，请检查你的 corp_id 和 corp_secret 配置")
            return
        data = json.dumps({
            'touser': self.to_user,
            'agentid': self.agent_id,
            'msgtype': 'text',
            'text': {
                "content": text_message
            }
        }, ensure_ascii=False).encode('utf8')
        res_data = self.__do_send_message__(access_token, data)
        if res_data.get('errcode') != 0:
            logger.error(f"企业微信推送失败，原因：{res_data}")
        else:
            logger.info(f"企业微信通知已推送")

    def send_img_text_message(self, title, content, url: str = None, img_url: str = None):
        try:
            access_token = self.get_access_token()
            if access_token is None:
                logger.error("获取企业微信 access_token 失败，请检查你的 corp_id 和 corp_secret 配置")
                return
            data = json.dumps({
                "touser": self.to_user,
                "msgtype": "news",
                "agentid": self.agent_id,
                "news": {
                    "articles": [
                        {
                            "title": title,
                            "description": content,
                            "picurl": img_url,
                            "url": url
                        }
                    ]
                },
            }, ensure_ascii=False).encode('utf8')
            res_data = self.__do_send_message__(access_token, data)
            if res_data.get('errcode') != 0:
                logger.error(f"企业微信推送失败：{res_data}")
            else:
                logger.info(f"企业微信通知已推送")
        except Exception as e:
            logger.error(f"企业微信推送失败，原因：{e}", exc_info=True)
            return
