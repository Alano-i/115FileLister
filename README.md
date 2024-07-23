# 115 File Lister

Figma 设计稿-高保真可交互原型：[移动端](https://www.figma.com/proto/XsOdLNW1WeIlO9buKodqlo/115Filelister?node-id=72-1130&starting-point-node-id=72%3A1130&page-id=0%3A1&viewport=142%2C355%2C0.53&t=wv2Z9bZiib2B1Us7-1&scaling=min-zoom&content-scaling=fixed&show-proto-sidebar=1&locale=en)   +   [PC端](https://www.figma.com/proto/XsOdLNW1WeIlO9buKodqlo/115Filelister?page-id=0%3A1&node-id=16-3749&viewport=-645%2C974%2C0.49&t=SfL28hroOfJAU1Lo-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=16%3A3749)，平时精力有限，欢迎PR.


## 部署
```yaml
version: '3'
services:
  redir115:
    image: alanoo/115_file_lister:latest
    container_name: 115_file_lister
    restart: always
    network_mode: bridge
    ports:
      - 9115:80
    volumes:
      - /appdata/115_file_lister:/app/data
```


## 调试
### 后端安装依赖
```bash
make postinstall
```

#### 后端
```bash
make dev-b
```

#### 前端
```bash
make dev-f
```

#### 同时启动
```bash
make dev
```

## API文档
后端启动后，浏览器访问 `http://localhost:9115/docs` 查看 API 文档。

## 致谢
后端：以上功能的后端核心实现，都来自 [@ChenyangGao](https://github.com/ChenyangGao) 大佬的 [项目](https://github.com/ChenyangGao/web-mount-packs)，本项目的后端部分只是做了微不足道的搬运而已，感谢！

前端：UI页面由 [zkl2333](https://github.com/zkl2333) 大佬帮忙实现，感谢。

