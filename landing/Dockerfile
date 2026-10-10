FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

RUN addgroup -S nextgroup && adduser -S nextuser -G nextgroup

COPY --from=builder --chown=nextuser:nextgroup /app/package*.json ./
COPY --from=builder --chown=nextuser:nextgroup /app/.next ./.next
COPY --from=builder --chown=nextuser:nextgroup /app/public ./public
COPY --from=builder --chown=nextuser:nextgroup /app/node_modules ./node_modules

USER nextuser
EXPOSE 3001
CMD ["npm", "run", "start", "--", "-p", "3001"]
