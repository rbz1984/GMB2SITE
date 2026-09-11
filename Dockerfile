FROM node:20-alpine

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY . .

RUN mkdir -p sites

ENV NODE_ENV=production
ENV PORT=8210

EXPOSE 8210

CMD ["node", "server.js"]
