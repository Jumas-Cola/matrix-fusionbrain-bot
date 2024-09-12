FROM node:20 AS builder

WORKDIR /src
COPY . /src

RUN npm ci
RUN npm run build

FROM node:20

ENV NODE_ENV=production
WORKDIR /bot

COPY --from=builder /src/lib /bot/lib
COPY --from=builder /src/package*.json /bot
COPY --from=builder /src/config /bot/config

RUN npm ci

CMD ["node", "lib/index.js"]
