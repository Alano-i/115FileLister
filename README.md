# 115 File Lister

Figma 设计稿-高保真可交互原型：[移动端](https://www.figma.com/proto/XsOdLNW1WeIlO9buKodqlo/115Filelister?page-id=0%3A1&node-id=411-1764&viewport=-605%2C861%2C0.5&t=RkiOH1qpBqISYwc2-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=411%3A1764&show-proto-sidebar=1)   +   [PC端](https://www.figma.com/proto/XsOdLNW1WeIlO9buKodqlo/115Filelister?page-id=0%3A1&node-id=407-1351&viewport=-605%2C861%2C0.5&t=RkiOH1qpBqISYwc2-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=407%3A1351&show-proto-sidebar=1)，平时精力有限，欢迎PR.

## 部署

```yaml
version: '3'
services:
  115_file_lister:
    image: alanoo/115_file_lister:latest
    container_name: 115_file_lister
    restart: always
    network_mode: bridge
    ports:
      - 9115:9115
    volumes:
      - /appdata/115_file_lister:/app/data
    environment:
      - path_persistence_commitment="true"
```
```bash
docker run -d \
    --name='115_file_lister' \
    --restart always \
    -p 9115:9115 \
    -e path_persistence_commitment="true" \
    -v '/appdata/115_file_lister':'/app/data' \
    alanoo/115_file_lister:latest
```

在 `app/data/115-cookies.txt` 设置 `cookie` ，重启，然后浏览器访问 `IP:9115`

## 调试
```bash
# 安装依赖
make install

# 启动
make dev
```

### API文档
后端启动后，浏览器访问 `http://localhost:9115/docs` 查看 API 文档。

## 致谢
后端：本项目的后端部分的核心实现，都来自 [@ChenyangGao](https://github.com/ChenyangGao) 大佬的 [项目](https://github.com/ChenyangGao/web-mount-packs)。本项目只是做了微不足道的搬运而已，感谢！

前端：UI页面由 [zkl2333](https://github.com/zkl2333) 大佬帮忙实现，感谢。