# registry.cn-hangzhou.aliyuncs.com/nloves/node:18.20-alpine 是自己阿里云镜像仓库的镜像，需要在构建节点先拉取依赖的镜像

FROM registry.cn-hangzhou.aliyuncs.com/nloves/node:18.20-alpine AS dependencies

LABEL maintainer=ns

WORKDIR /home/app

COPY package*.json .npmrc ./

RUN npm i --legacy-peer-deps

FROM registry.cn-hangzhou.aliyuncs.com/nloves/node:18.20-alpine AS builder

WORKDIR /home/app

COPY --from=dependencies /home/app/node_modules ./node_modules
COPY . .

RUN npm run build


FROM registry.cn-hangzhou.aliyuncs.com/nloves/node:18.20-alpine AS runner

WORKDIR /home/app

# 将构建输出复制到 runner 阶段
COPY --from=builder /home/app/package*.json ./
COPY --from=builder /home/app/.next /home/app/.next
COPY --from=builder /home/app/public /home/app/public

# 安装生产依赖
RUN npm install --production

# ENV NODE_ENV prod

EXPOSE 3000

USER node

# VOLUME [ "/app/public" ]

CMD ["npm", "run", "start"]