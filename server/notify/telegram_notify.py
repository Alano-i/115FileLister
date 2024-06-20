import httpx
import inject
import logging
import os
import json

from tenacity import retry, stop_after_attempt, wait_random_exponential

from server.binderapi import TelegramConf

logger = logging.getLogger(__name__)


class TelegramNotify:
    def __init__(self):
        telegram_conf: TelegramConf = inject.instance(TelegramConf)
        self.base_url = telegram_conf.base_url
        self.telegram_token = telegram_conf.token
        self.telegram_chat_id = telegram_conf.chat_id
        self.proxies = telegram_conf.proxies

    @retry(wait=wait_random_exponential(min=1, max=20), stop=stop_after_attempt(3))
    def _do_send_photo(self, data):
        url = f'{self.base_url}{self.telegram_token}/sendPhoto'
        res = httpx.post(url, data=data, proxies=self.proxies)
        return res.json()

    @staticmethod
    def parse_msg_to_markdownv2(msg):
        escape_chars = '_*[]()~`>#+-=|{}.!'
        return ''.join(['\\' + char if char in escape_chars else char for char in msg])

    def send_photo_message(self, title, content, url: str = None, img_url: str = None):
        try:
            msg = self.parse_msg_to_markdownv2(f'{title}\n\n{content}')
            hub_links = json.dumps({
                "inline_keyboard": [
                    [{"text": "🔗 项目地址", "url": url}]
                ]
            })
            data = {
                'reply_markup': hub_links,
                'chat_id': self.telegram_chat_id,
                'caption': msg,
                'photo': img_url,
                'parse_mode': 'MarkdownV2'
            }
            res_data = self._do_send_photo(data)
            if not res_data['ok']:
                logger.error(f"Telegram 通知推送失败: {res_data['description']}")
            else:
                logger.info(f"Telegram 通知已推送")
        except Exception as e:
            logger.error(f"Telegram消息推送失败，原因: {e}", exc_info=True)
            return
