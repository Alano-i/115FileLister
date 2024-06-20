from pydantic import BaseModel
from .audio_tools import audio_clip, move_to_dir, diy_abs, move_out, all_add_tag, add_cover
from .podcast import podcast_main, get_xml_url
from .event import auto_podcast
from .xmly_download import xmly_main, xmly_download
import logging
import datetime
import time
import os
import inject
from server.binderapi import *
from .functions import *
from server.route.user import RequestData
logger = logging.getLogger(__name__)

move_out_config = [
    {
        "name": "🔖 DIY元数据",
        "value": 'diy'
    },
    {
        "name": "🎯 运行移出文件夹操作",
        "value": 'move'
    },
    {
        "name": "📕 整理文件夹、DIY元数据",
        "value": 'add_and_move'
    }
]
clip_config = [
    {
        "name": "📕 剪辑、整理、添加元数据",
        "value": 'clip_and_move'
    },
    {
        "name": "🎯 仅剪辑",
        "value": 'clip'
    }
]
choose_config = [
    {
        "name": "📕 方案一",
        "value": 'one'
    },
    {
        "name": "🎯 方案二",
        "value": 'two'
    }
]
media_list = [
    {
        "name": "📕 有声书",
        "value": 'audio_book'
    },
    {
        "name": "🎹 音乐",
        "value": 'music'
    },
    {
        "name": "🌍 批量处理存量有声书",
        "value": 'auto_all'
    }
]

state_list = [
    {
        "name": "✅ 开启",
        "value": 'on'
    },
    {
        "name": "📴 关闭",
        "value": 'off'
    }
]
dl_list = [
    {
        "name": "✅ 全集",
        "value": 'all'
    },
    {
        "name": "🎯 指定页面",
        "value": 'page'
    },
    {
        "name": "🎹 指定单集",
        "value": 'track'
    }
]


def cmd_config(config):
    global src_base_path_book, downloads_path,src_base_path_music, dst_base_path, server_url
    src_base_path_book = config.get('src_base_path_book', '')
    src_base_path_music = config.get('src_base_path_music', '')
    downloads_path = config.get('downloads_path', '')
    dst_base_path = config.get('dst_base_path', '')
    server_url = config.get('server_url', '').strip('/')

# 获取所有的播客源列表


def get_rss_url():
    global json_data
    no_data = [
        {
            "name": "没有获取到数据，可能还从未生成",
            "value": ''
        }
    ]
    # podcast_json_path = src_base_path_book or src_base_path_music
    podcast_json_path = os.environ.get('WORKDIR', '/app/data')
    file_path = os.path.join(podcast_json_path, 'podcast.json')
    # 判断文件是否存在
    if not os.path.exists(file_path):
        logger.warning(f"保存播客URL的json文件不存在，可能还从未生成！")
        json_data = {}
        return no_data
    json_data = read_json_file(file_path)
    if json_data:
        url_list = []
        for name, info in json_data.items():
            entry = {
                "name": name,
                "value": info["podcast_url"]
            }
            url_list.append(entry)
    else:
        logger.warning(f"保存播客URL的json文件为空，可能还从未生成！")
        url_list = no_data
    return url_list

# 根据选择的播客源，获取对应的xml与封面URL


def filter_json_by_podcast_url(url_list_config):
    filtered_data = {}
    for name, info in json_data.items():
        if info["podcast_url"] in url_list_config:
            filtered_data[name] = info
    return filtered_data

# 音频剪辑


def audio_clip_m(data: RequestData):
    # 获取注入的配置
    base_conf = inject.instance(ServerConf)
    # 获取请求体中的数据，无需从查询参数中获取
    input_dirs = data.input_dirs
    output_dir = data.output_dir
    series = data.series
    cliped_folder = data.cliped_folder
    audio_start = data.audio_start
    audio_end = data.audio_end
    clip_configs = data.clip_configs
    author = data.author
    reader = data.reader
    year = data.year
    albums = data.albums
    art_album = data.art_album
    subject = data.subject
    podcast_summary = data.podcast_summary
    src_base_path_book = base_conf.src_base_path_book
    src_base_path = src_base_path_book
    # cliped_folder = cliped_folder or series
    state = False
    use_filename = data.use_filename
    make_podcast = data.make_podcast
    logger.info(f"任务\n开始运行音频剪辑\n输入路径：[{input_dirs}]\n输出路径：[{output_dir}/{cliped_folder}]\n开始时间：[{audio_start}]\n结束倒数秒数：[{audio_end}]\n书名：['{series}']\n作者：['{author}']\n演播者：['{reader}']\n发布年份：['{year}']\n专辑：['{albums}']\n专辑艺术家：['{art_album}']\n简介：['{podcast_summary}']")

    # .common.set_cache('audio_clip', 'input_dirs', input_dirs)
    input_dirs_s = input_dirs.split('\n')
    albums_s = []
    if albums:
        albums_s = albums.split('\n')
    album = ''
    xmly_dl = False
    for i, input_dir in enumerate(input_dirs_s):
        if '影音视界' in input_dir:
            input_dir = f"/Media{input_dir.split('影音视界')[1]}"
        input_dir = process_path(input_dir)
        output_dir = process_path(output_dir)
        output_dir = f"/{output_dir.strip('/')}" if output_dir else input_dir
        if albums:
            album = albums_s[i]
        series, author, reader, year, subject, podcast_summary = get_audio_info_all(
            input_dir, series, author, reader, year, subject, podcast_summary)

        cliped_folder = cliped_folder or get_book_dir_name(
            series, author, reader)
        art_album = art_album or series
        logger.info(f"任务开始运行音频剪辑\n解析后数据：\n输入路径：[{input_dir}]\n输出路径：[{output_dir}/{cliped_folder}]\n开始时间：[{audio_start}]\n结束倒数秒数：[{audio_end}]\n书名：['{series}']\n作者：['{author}']\n演播者：['{reader}']\n发布年份：['{year}']\n专辑：['{albums or '自动按每100集划分'}']\n专辑艺术家：['{art_album}']\n简介：['{podcast_summary}']")
        result = audio_clip(input_dir, output_dir, cliped_folder, audio_start, audio_end, clip_configs,
                            author, year, reader, series, podcast_summary, album, art_album, use_filename, subject, xmly_dl)
        if not result:
            continue
        time.sleep(5)
        if make_podcast:
            try:
                # dst_base_path = "/app/frontend/static/podcast/audio"
                # dst_base_path = "/data/plugins/podcast"
                # src_base_path = '/Media/有声书'
                # hlink(src_base_path, dst_base_path)
                audio_path = f"{output_dir}/{cliped_folder}"
                is_group = True
                short_filename = True
                is_book = True
                time.sleep(5)
                state = auto_podcast(audio_path, '', series, podcast_summary,
                                     subject, author, reader, year, is_group, short_filename, is_book)
                # state = podcast_main(series, audio_path, podcast_summary, subject, author, reader,year,is_group,short_filename,is_book)
                if state:
                    logger.info(f'生成博客源 RSS XML 任务完成')
                else:
                    logger.error(f'生成博客源 RSS XML 任务失败')
            except Exception as e:
                logger.error(f"「生成播客源」失败，原因：{e}")
        series, author, reader, year, subject, podcast_summary = '', '', '', '', '', ''

# 生成播客源


def podcast_m(data: RequestData):
    logger.info(f'接收到请求数据：{data}')
    base_conf = inject.instance(ServerConf)
    logger.info(f"base_conf:{base_conf}")
    logger.info(f"src_base_path_book:{base_conf.src_base_path_book}")
    src_base_path_book = base_conf.src_base_path_book
    is_book_config = data.is_book_config  # 类型：有声书 音乐，存量
    book_title = data.book_title
    audio_paths = data.audio_paths   # 输入文件夹名称或完整路径
    auto_path = data.auto_path    # 存量有声书父文件夹路径
    force = data.force   # 存量文件夹强制重新生成播客源
    podcast_summary = data.podcast_summary
    podcast_category = data.podcast_category
    podcast_author = data.author
    reader = data.reader
    pub_year = data.year
    is_group = data.is_group    # 第1季强制200集 默认
    short_filename = data.short_filename
    deep = data.deep
    # audio_paths = /Media/有声书/三国
    # src_base_path = /Media/有声书

    if is_book_config == 'auto_all':
        if '影音视界' in auto_path:
            auto_path = f"/Media{auto_path.split('影音视界')[1]}"
        auto_path = process_path(auto_path)
        is_book = True
        subfolders = ''
        # 获取子文件夹具体路径列表
        subfolders = [os.path.join(auto_path, f) for f in os.listdir(
            auto_path) if os.path.isdir(os.path.join(auto_path, f))]
        # logger.info(f"subfolders：{subfolders}")
        for audio_path in subfolders:
            try:
                if audio_path:
                    logger.info(f"开始处理：['{audio_path}']")
                    flag_txt_path = os.path.join(audio_path, 'podcast.txt')
                    if not force:
                        if os.path.exists(flag_txt_path):
                            logger.warning(f"['{audio_path}'] 路径已经生成过播客源，跳过。")
                            continue
                    book_title, podcast_author, reader, pub_year, podcast_category, podcast_summary = '', '', '', '', '', ''
                    book_title, podcast_author, reader, pub_year, podcast_category, podcast_summary = get_audio_info_all(
                        audio_path, book_title, podcast_author, reader, pub_year, podcast_category, podcast_summary)

                    audio_files, fill_num, audio_num = get_audio_files(
                        audio_path)
                    if not audio_files:
                        logger.warning(
                            f"{audio_path} 路径中没有音频文件，跳过生成播客源。")
                        continue
                    else:
                        state = auto_podcast(audio_path, '', book_title, podcast_summary, podcast_category,
                                             podcast_author, reader, pub_year, is_group, short_filename, is_book)
                        if state:
                            create_podcast_flag_file(audio_path)
            except Exception as e:
                logger.error(
                    f"批量为存量有声书生成播客源处理 ['{audio_path}'] 失败，原因：{e}")
                continue
        logger.info(f"存量生成播客源任务完成")
        # return PluginCommandResponse(True, f'存量生成播客源任务完成')
    else:
        src_base_path = src_base_path_book if is_book_config == 'audio_book' else src_base_path_music
        is_book = False if is_book_config == 'music' else True
        state = False
        if not book_title and not audio_paths:
            logger.info(f"未设置书名和路径，请设置后重试")
            return

        book_title_new = book_title
        try:
            logger.info(
                f"任务 - 生成播客源 URL\n书名：['{book_title}']\nis_book：['{is_book}']\n输入路径：['{audio_paths}']\n有声书简介：['{podcast_summary}']\n有声书分类：['{podcast_category}']\n作者：['{podcast_author}']\n第1季强制200集：{is_group}")
            audio_path_list = audio_paths.split('\n')
            for i, audio_path in enumerate(audio_path_list):
                audio_path = process_path(audio_path)
                if '影音视界' in audio_path:
                    audio_path = f"/Media{audio_path.split('影音视界')[1]}"
                if src_base_path not in audio_path and audio_path:
                    audio_path = f"/{src_base_path.strip('/')}{audio_path}"
                if not book_title:
                    book_title_new = os.path.basename(audio_path).strip('/')
                else:
                    if not audio_path:
                        audio_path = f"/{src_base_path.strip('/')}/{book_title}"

                audio_files, fill_num, audio_num = get_audio_files(audio_path)
                if not audio_files:
                    logger.warning(
                        f"{audio_path} 路径中没有音频文件，跳过生成播客源。")
                    continue
                else:
                    book_title_new, podcast_author, reader, pub_year, podcast_category, podcast_summary = get_audio_info_all(
                        audio_path, book_title, podcast_author, reader, pub_year, podcast_category, podcast_summary)
                    if not book_title_new:
                        book_title_new = os.path.basename(
                            audio_path).strip('/')
                    if deep:
                        state = podcast_main(book_title_new, audio_path, podcast_summary, podcast_category,
                                             podcast_author, reader, pub_year, is_group, short_filename, is_book)
                    else:
                        state = auto_podcast(audio_path, '', book_title_new, podcast_summary, podcast_category,
                                             podcast_author, reader, pub_year, is_group, short_filename, is_book)
                podcast_author, reader, pub_year, podcast_category, podcast_summary = '', '', '', '', ''
        except Exception as e:
            logger.error(f"「生成播客源」失败，原因：{e}")
            # return PluginCommandResponse(False, f'生成博客源 RSS XML 任务失败')

        if state:
            logger.info(f"生成博客源 RSS XML 任务完成")
        else:
            logger.error(f"生成博客源 RSS XML 任务失败")


def add_cover_m(data: RequestData):
    # 输入路径 /Media/有声书/ 需要输入路径下有cover.jpg
    audio_path = data.audio_paths
    audio_path = process_path(audio_path)
    if '影音视界' in audio_path:
        audio_path = f"/Media{audio_path.split('影音视界')[1]}"
    cover_art_path = os.path.join(audio_path, 'cover.jpg')
    if not os.path.exists(cover_art_path):
        logger.error(f"输入文件下没有封面文件 cover.jpg，请准备好封面文件重试")
    logger.info(f"cover_art_path: {cover_art_path}")
    i = 0
    try:
        for dirpath, _, filenames in os.walk(audio_path):
            for filename in filenames:
                file_path = os.path.join(dirpath, filename)
                if datetime.now().second % 10 == 0 or i == 0:
                    logger.info(f"开始处理: {file_path}")
                add_cover(file_path, cover_art_path)
                i = i+1
        logger.info(f"封面修改完成")
    except Exception as e:
        logger.error(f"「添加封面」失败，原因：{e}")


# 整理有声书 分配到子文件夹 1-100 101-200 201-300, 并添加元数据
def move_to_dir(data: RequestData):
    move_out_configs = data.move_out_configs
    output_dir = data.output_dir
    series = data.book_title
    authors = data.author
    cut = data.cut
    audio_start = data.audio_start
    audio_end = data.audio_end
    use_filename = data.use_filename
    reader = data.reader
    podcast_summary = data.podcast_summary
    year = data.year
    album = data.album
    art_album = data.art_album
    subject = data.subject
    diy_cover = data.diy_cover

    output_dir = process_path(output_dir)
    if '影音视界' in output_dir:
        output_dir = f"/Media{output_dir.split('影音视界')[1]}"

    logger.info(
        f"任务\n开始整理系列文件夹\n输入路径：[{output_dir}]\n系列：['{series}']\n作者：['{authors}']\n演播者：['{reader}']\n发布年份：['{year}']")
    if move_out_configs == 'move':
        move_out(output_dir)
    elif move_out_configs == 'add_and_move':
        move_to_dir(output_dir, authors, year, reader, series, podcast_summary,
                    album, art_album, move_out_configs, use_filename, subject)
        diy_abs(output_dir, series, authors, reader, year)
    else:
        all_add_tag(output_dir, authors, year, reader, series, podcast_summary, album,
                    art_album, use_filename, subject, diy_cover, cut, audio_start, audio_end)

    logger.info(f'整理系列文件夹任务完成')


def xmly_download(data: RequestData):
    dl = data.dl
    save_path = data.save_path  # 保存路径基础文件夹
    book_name = data.book_name  # 填写建议：书名-作者-演播者
    album_id = data.album_id  # 专辑 ID
    page = data.page  # 下载分页内所有音频，如：1
    track = data.track  # 单集 ID，如：456', 'https://www.ximalaya.com/sound/456
    index_on = data.index_on  # 开启集号偏移量：📴 关闭', '若原标题中不含有集号信息，开启将增加 第xx集 前缀

    save_path = os.path.join(save_path, book_name)
    os.makedirs(save_path, exist_ok=True)
    if xmly_download(save_path, dl, album_id, page, track, index_on, int(index_offset)):
        logger.info(f'下载喜马拉雅音频完成')
    else:
        logger.error(f'下载喜马拉雅音频失败')


# 更新播客 同步喜马拉雅并更新到播客节目中，仅支持免费音频，版权归喜马拉雅所有，请支持正版
def update_podcast():
    if xmly_main():
        logger.info(f'同步喜马拉雅并更新播客完成')
    else:
        logger.error(f'同步喜马拉雅并更新播客失败')
