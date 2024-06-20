import httpx
import inject
import logging

from server.binderapi import BarkConf

from tenacity import retry, stop_after_attempt, wait_random_exponential

logger = logging.getLogger(__name__)


class BarkNotify:
    def __init__(self):
        bark_conf: BarkConf = inject.instance(BarkConf)
        self.bark_url = bark_conf.base_url.strip('/')
        self.bark_sound = bark_conf.sound
        self.bark_group = bark_conf.group
        self.bark_icon = bark_conf.icon

    @retry(wait=wait_random_exponential(min=1, max=20), stop=stop_after_attempt(3))
    def _do_send_message(self, params):
        url = self.bark_url
        res = httpx.get(url, params=params, timeout=30)
        return res.json()

    def send_message(self, title, content):
        try:
            params = {
                'title': title,
                'body': content,
                'sound': self.bark_sound,
                'group': self.bark_group,
                'icon': self.bark_icon,
            }
            res_data = self._do_send_message(params)
            if res_data['code'] != 200:
                logger.error(f"Bark 通知推送失败: {res_data['message']}")
            else:
                logger.info(f"Bark 通知已推送")
        except Exception as e:
            logger.error(f"Bark 通知推送失败，原因: {e}", exc_info=True)
            return
