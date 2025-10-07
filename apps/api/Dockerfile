FROM node:20-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml* .npmrc* ./
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY . .
RUN pnpm install --frozen-lockfile && pnpm generate && pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
