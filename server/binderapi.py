class AllConf:

    def __init__(self, all_conf):
        self.all_config = all_conf
class UsersConf:

    def __init__(self, users):
        self.users = users

class ServerConf:

    def __init__(self, src_base_path_book,src_base_path_music,downloads_path,server_url,user,password,magic,cron_expression='5 8-23 * * *',mbot_download_api='',update_podcast_switch=False):
        self.src_base_path_book = src_base_path_book
        self.src_base_path_music = src_base_path_music
        self.downloads_path = downloads_path
        self.server_url = server_url
        self.user = user
        self.password = password
        self.magic = magic
        self.mbot_download_api = mbot_download_api
        self.cron_expression = cron_expression
        self.update_podcast_switch = update_podcast_switch

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
