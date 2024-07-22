#!/usr/bin/env python3
# encoding: utf-8

import uvicorn
import os
from server.file_lister import *
# 静态文件服务：https://www.neoteroi.dev/blacksheep/static-files/
app.serve_files("./frontend")

def echo_author():
    docker_version = os.environ.get("VERSION_115_FILE_LISTER")
    print("""开始启动
                
 ██╗ ██╗███████╗    ███████╗██╗██╗     ███████╗    ██╗     ██╗███████╗████████╗███████╗██████╗ 
███║███║██╔════╝    ██╔════╝██║██║     ██╔════╝    ██║     ██║██╔════╝╚══██╔══╝██╔════╝██╔══██╗
╚██║╚██║███████╗    █████╗  ██║██║     █████╗      ██║     ██║███████╗   ██║   █████╗  ██████╔╝
 ██║ ██║╚════██║    ██╔══╝  ██║██║     ██╔══╝      ██║     ██║╚════██║   ██║   ██╔══╝  ██╔══██╗
 ██║ ██║███████║    ██║     ██║███████╗███████╗    ███████╗██║███████║   ██║   ███████╗██║  ██║
 ╚═╝ ╚═╝╚══════╝    ╚═╝     ╚═╝╚══════╝╚══════╝    ╚══════╝╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
                """)
    print(f"Version: {docker_version}")

def startup():
    echo_author()
    print(f'程序启动成功')

def main():
    startup()
    uvicorn.run(app, host="0.0.0.0", port=9115, reload=False, proxy_headers=True, forwarded_allow_ips="*")

if __name__ == '__main__':
    main()
