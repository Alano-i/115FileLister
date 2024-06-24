import ruamel.yaml
import os
from server.binderapi import *
import inject
import logging

# from server.func.audio_tools import audio_tools_config
# from server.func.event import event_config
# from server.func.podcast import podcast_config
# from server.func.command import cmd_config
# from server.func.functions import hlink, process_path
# from server.func.xmly_download import xmly_dl_config
# from server.tasks.update_podcast import update_podcast_config

logger = logging.getLogger(__name__)
conf_file = f"{os.environ.get('WORKDIR')}/conf/base_config.yml"


def deep_update_remove_rename(original, new_data, keys_to_rename=None, keys_to_remove=None):
    """
    更新字典中的值、删除指定的键、并重命名键。
    :param original: 原始字典。
    :param new_data: 包含更新数据的字典。
    :param keys_to_remove: 包含要删除键的列表，支持点表示法来指定嵌套键。
    :param keys_to_rename: 一个字典，表示要重命名的键及其新名字。
    """
    # 重命名键
    if keys_to_rename:
        for old_key_path, new_key in keys_to_rename.items():
            _rename_key_recursive(original, old_key_path.split('.'), new_key)

    # 更新
    deep_update(original, new_data)

    # 处理要删除的键
    if keys_to_remove:
        for key_path in keys_to_remove:
            keys = key_path.split('.')
            _remove_key_recursive(original, keys)


def deep_update(original, new_data):
    """
    递归合并两个字典，包括嵌套的字典。
    如果遇到同名键，且值也是字典，则递归合并这两个字典；
    但不会覆盖原始数据中已经存在的键值对。
    :param original: 原始字典。
    :param new_data: 包含更新数据的字典。
    """
    for key, value in new_data.items():
        # 如果键在原始字典中不存在，直接添加
        if key not in original:
            original[key] = value
        else:
            # 如果两个字典中都有这个键，且对应的值都是字典，则递归合并
            if isinstance(original[key], dict) and isinstance(value, dict):
                deep_update(original[key], value)
            # 如果键在原始字典中已存在，且对应的值不是字典，则不进行操作（不覆盖）
            else:
                continue


def _remove_key_recursive(dic, keys):
    """
    递归删除字典中的键。
    :param dic: 字典。
    :param keys: 键的列表，表示要删除的键的路径。
    """
    key = keys.pop(0)
    if len(keys) == 0:
        if key in dic:
            del dic[key]
    else:
        if key in dic and isinstance(dic[key], dict):
            _remove_key_recursive(dic[key], keys)


def _rename_key_recursive(dic, old_keys, new_key):
    """
    递归重命名字典中的键。
    :param dic: 字典。
    :param old_keys: 旧键名的路径列表。
    :param new_key: 新键名。
    """
    old_key = old_keys.pop(0)
    if len(old_keys) == 0:
        if old_key in dic:
            dic[new_key] = dic.pop(old_key)
    else:
        if old_key in dic and isinstance(dic[old_key], dict):
            _rename_key_recursive(dic[old_key], old_keys, new_key)


def update_conf_file(**kwargs):
    update_flag=kwargs.get('update_flag', False)
    config = {
        "server": {
            "server_url": kwargs.get('server_url', ''),
            "user": kwargs.get('user', 'admin'),
            "password": kwargs.get('password', 'admin'),
        },
        "users": [
                {"username": "admin", "uuid": "001", "password": "admin", "is_admin": True},
                {"username": "podsuite", "uuid": "002", "password": "podsuite", "is_admin": False},
            ],
        "notify": {
            "channel": kwargs.get('channel', 'qywx'),
            "pic_url": kwargs.get('pic_url', ''),
            "notify_switch": kwargs.get('notify_switch', False),
            "public": {
                "notify_img": ""
            },
            "qywx": {
                "qywx_base_url": kwargs.get('qywx_base_url', 'https://qyapi.weixin.qq.com'),
                "corpid": kwargs.get('corpid', ''),
                "corpsecret": kwargs.get('corpsecret', ''),
                "agentid": kwargs.get('agentid', ''),
                "touser": kwargs.get('touser', '@all'),
            },
            "bark": {
                "bark_url": kwargs.get('bark_url', ''),
                "bark_sound": kwargs.get('bark_sound', 'chime'),
                "bark_group": kwargs.get('bark_group', 'PodSuite'),
                "bark_icon": kwargs.get('bark_icon', ''),
            },
            "telegram": {
                "tg_base_url": kwargs.get('tg_base_url', 'https://api.telegram.org/bot'),
                "tgbot_token": kwargs.get('tgbot_token', ''),
                "tg_chat_id": kwargs.get('tg_chat_id', ''),
                "proxy": kwargs.get('proxy', ''),
            }

        },
        "theme": kwargs.get('theme', 'dark')
    }

    keys_to_remove = [
        # 要删除的键
    ]
    keys_to_rename = {
        # 要重命名的键
    }
    if not os.path.exists(conf_file) or update_flag:
        with open(conf_file, 'w', encoding='utf-8') as init_f:
            ruamel.yaml.dump(config, init_f, Dumper=ruamel.yaml.RoundTripDumper, allow_unicode=True)
        if update_flag:
            logger.info(f"配置文件已更新")
    else:
        with open(conf_file, 'r', encoding='utf-8') as exist_f:
            exist_config = ruamel.yaml.load(exist_f, Loader=ruamel.yaml.RoundTripLoader)
            if exist_config:
                deep_update_remove_rename(exist_config, config,
                                          keys_to_rename=keys_to_rename,
                                          keys_to_remove=keys_to_remove)
                with open(conf_file, 'w', encoding='utf-8') as replace_exist_f:
                    ruamel.yaml.dump(exist_config, replace_exist_f, Dumper=ruamel.yaml.RoundTripDumper,
                                     allow_unicode=True)
            else:
                with open(conf_file, 'w', encoding='utf-8') as init_f:
                    ruamel.yaml.dump(config, init_f, Dumper=ruamel.yaml.RoundTripDumper, allow_unicode=True)


class Config:
    def __init__(self, config_dict):
        self._config_dict = config_dict

    def __getattr__(self, name):
        value = self._config_dict[name]
        if isinstance(value, dict):
            return Config(value)
        elif isinstance(value, list):
            return [Config(item) if isinstance(item, dict) else item for item in value]
        return value

    def __getitem__(self, name):
        value = self._config_dict[name]
        if isinstance(value, dict):
            return Config(value)
        elif isinstance(value, list):
            return [Config(item) if isinstance(item, dict) else item for item in value]
        return value


def parse_conf_file():
    with open(conf_file, 'r', encoding='utf-8') as f:
        conf_dict = ruamel.yaml.safe_load(f.read())
        return Config(conf_dict)
    
# 将配置信息绑定到依赖注入容器中。一旦配置信息被绑定到容器中，它们的值将保持不变，除非显式地重新调用 conf() 函数来重新读取并更新配置信息
def conf(binder):
    conf = parse_conf_file()

    # 将读取到本地yml文件内的配置转成字典，并注入到容器
    config_dict = conf.__dict__['_config_dict']
    all_config = AllConf(all_conf=config_dict)
    binder.bind(AllConf, all_config)

    # 用户信息设置
    users_conf = conf.users
    users = UsersConf(users=users_conf)
    binder.bind(UsersConf, users)


    # 基础设置
    base_conf = conf.server
    # 通知设置
    notify_conf = conf.notify
    qywx_conf = notify_conf.qywx
    bark_conf = notify_conf.bark
    telegram_conf = notify_conf.telegram
    pic_url = notify_conf.pic_url
    notify_switch=notify_conf.notify_switch
    # 主题设置
    theme_conf = conf.theme

    # 将基础设置绑定注入到整个项目
    server_url = base_conf.server_url
    user=base_conf.user
    password=base_conf.password
    
    server_conf = ServerConf(server_url, user, password)
    binder.bind(ServerConf, server_conf)
    
    # 将通知设置绑定注入到整个项目
    if notify_conf.channel:
        notify_channel = notify_conf.channel.split(",")
    else:
        notify_channel = []
    notify_channel = [channel.strip() for channel in notify_channel]
    notify = NotifyConf(channel=notify_channel,pic_url=pic_url,notify_switch=notify_switch)
    binder.bind(NotifyConf, notify)


    if 'qywx' in notify_channel:
        qywx = QywxConf(base_url=qywx_conf.qywx_base_url, corp_id=qywx_conf.corpid, corp_secret=qywx_conf.corpsecret,
                        agent_id=qywx_conf.agentid, to_user=qywx_conf.touser)
        binder.bind(QywxConf, qywx)

    if 'bark' in notify_channel:
        if not bark_conf.bark_icon:
            bark_img_url = f"{base_conf.server_url}/api/static/server/notify/icon.png" if base_conf.server_url else f"http://localhost:8686/api/static/server/notify/icon.png"
            bark_conf.bark_icon = bark_img_url
        bark = BarkConf(base_url=bark_conf.bark_url, sound=bark_conf.bark_sound,
                        group=bark_conf.bark_group, icon=bark_conf.bark_icon)
        binder.bind(BarkConf, bark)

    if 'telegram' in notify_channel:
        telegram = TelegramConf(base_url=telegram_conf.tg_base_url, token=telegram_conf.tgbot_token,
                                chat_id=telegram_conf.tg_chat_id, proxy=telegram_conf.proxy)
        binder.bind(TelegramConf, telegram)

    theme = ThemeConf(theme_conf=theme_conf)
    binder.bind(ThemeConf, theme)


def update_conf():
    #重新读取本地yml配置并注入容器（会先清除之前的注入）
    inject.clear_and_configure(conf)

    base_conf = inject.instance(ServerConf)
    notify_conf = inject.instance(NotifyConf)
    server_url = base_conf.server_url
    
    pic_url = notify_conf.pic_url
    notify_switch = notify_conf.notify_switch

    config = {
        "server_url": server_url,
        "notify_switch": notify_switch,
        "pic_url": pic_url,
    }


    


