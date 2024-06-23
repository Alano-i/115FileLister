class AllConf:

    def __init__(self, all_conf):
        self.all_config = all_conf
class UsersConf:

    def __init__(self, users):
        self.users = users

class ServerConf:

    def __init__(self, server_url,user,password):
        self.server_url = server_url
        self.user = user
        self.password = password

class NotifyConf:

    def __init__(self, channel: list,pic_url='',notify_switch=False):
        self.NotifyChannel = channel
        self.pic_url = pic_url
        self.notify_switch = notify_switch

class BarkConf:

    def __init__(self, base_url, sound, group, icon):
        self.base_url = base_url
        self.sound = sound
        self.group = group
        self.icon = icon


class QywxConf:

    def __init__(self, base_url, corp_id, corp_secret, agent_id, to_user):
        self.base_url = base_url if base_url else "https://qyapi.weixin.qq.com"
        self.corp_id = corp_id
        self.corp_secret = corp_secret
        self.agent_id = agent_id
        self.to_user = to_user



class TelegramConf:

    def __init__(self, base_url, token, chat_id, proxy=None):
        self.base_url = base_url if base_url else "https://api.telegram.org/bot"
        self.token = token
        self.chat_id = chat_id
        self.proxies = None
        if proxy:
            self.proxies = {
                "http://": proxy,
                "https://": proxy,
                "socks5://": proxy,
            }

class ThemeConf:

    def __init__(self, theme_conf="dark"):
        self.theme = theme_conf
