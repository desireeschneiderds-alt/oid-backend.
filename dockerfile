FROM alpine:3.19

RUN apk add --no-cache \
    tttool \
    nodejs \
    npm

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
