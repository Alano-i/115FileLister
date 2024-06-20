# import os
# import httpx
# import logging
# import inject
# from server.func.xmly_download import xmly_main

# logger = logging.getLogger(__name__)


# def update_podcast_config(config):
#     global update_podcast_switch
#     update_podcast_switch = config.get('update_podcast_switch', False)


# class update_podcast:
#     def __init__(self):
#         self.podcast = "podcast"

#     def run(self):
#         if update_podcast_switch:
#             logger.info(f'定时任务启动，开始同步喜马拉雅并更新播客')
#             if xmly_main():
#                 logger.info(f'同步喜马拉雅并更新播客完成')
#             else:
#                 logger.error(f'同步喜马拉雅并更新播客失败')
#         else:
#             logger.info(f'定时更新播客源任务未启用，跳过。')
