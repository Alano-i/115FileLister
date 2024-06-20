import inject
import logging
from typing import Dict, Optional, Union, List

from server.binderapi import NotifyConf
from server.notify.bark_notify import BarkNotify
from server.notify.qywx_notify import QYWXNotify
from server.notify.telegram_notify import TelegramNotify

logger = logging.getLogger(__name__)


class NotifyControl:
    def __init__(self):
        notify_conf: NotifyConf = inject.instance(NotifyConf)
        self.notify_channel = notify_conf.NotifyChannel
        self.notify_switch = notify_conf.notify_switch
        self.pic_url = notify_conf.pic_url

    def send_message_by_tmpl(self, title: str, content: str, to_channel_name: Union[str | List[str]] = None, url: str = None, img_url: str = None):
        if not to_channel_name:
            to_channel_name = self.notify_channel
        if isinstance(to_channel_name, str):
            to_channel_name = [to_channel_name]
        try:
            if 'bark' in to_channel_name:
                BarkNotify().send_message(title=title, content=content)
            if 'qywx' in to_channel_name:
                QYWXNotify().send_img_text_message(title=title, content=content, url=url, img_url=img_url)
            if 'telegram' in to_channel_name:
                TelegramNotify().send_photo_message(title=title, content=content, url=url, img_url=img_url)
        except Exception as e:
            logger.error(f"通知失败，原因: {e}", exc_info=True)
            return

    def push_notify(self, msg_title, msg_digest, cover_image_url='', link_url=''):
        if not self.notify_switch: return
        image_url = cover_image_url if cover_image_url else self.pic_url
        NotifyControl().send_message_by_tmpl(title=msg_title,content=msg_digest, img_url=image_url, url=link_url)