FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm install

# Copy the rest of the application
COPY . .

EXPOSE 9090

CMD ["node", "server.js"]