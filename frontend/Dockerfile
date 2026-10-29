FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
ENV NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=$NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nextgroup && adduser -S nextuser -G nextgroup

COPY --from=builder --chown=nextuser:nextgroup /app/package*.json ./
COPY --from=builder --chown=nextuser:nextgroup /app/.next ./.next
COPY --from=builder --chown=nextuser:nextgroup /app/public ./public
COPY --from=builder --chown=nextuser:nextgroup /app/node_modules ./node_modules

USER nextuser
EXPOSE 3000
CMD ["npm", "run", "start"]
