#!/usr/bin/env python3
# encoding: utf-8
import os
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
    from server.file_lister import main
    startup()
    main()

if __name__ == "__main__":
    from pathlib import Path
    from sys import path

    path[0] = str(Path(__file__).parents[1])
    main()