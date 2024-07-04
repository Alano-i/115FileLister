#安装后端依赖包
postinstall:
	cd server && pip3 install -U -r requirements.txt

#启动前端
dev-f:
	cd frontend && pnpm dev &

#启动后端
dev-b:
	python3 start.py

#安装前端依赖包
install:
	cd frontend && pnpm i

#前端打包
build:
	cd frontend && npm run build

#启动前后端
#在终端执行 make dev
dev:dev-f dev-b

#启动前后端
#在终端执行 make dev
dev2:
	concurrently --kill-others-on-fail "make dev-f" "make dev-b"
dev-b2:
	concurrently --kill-others-on-fail "make dev-b"

postinstall2:
	concurrently --kill-others-on-fail "make postinstall"
