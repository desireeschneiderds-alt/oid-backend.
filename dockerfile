FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    libgmp10 \
    zlib1g \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fL https://github.com/brouhaha/tttool/releases/download/v1.9/tttool-x86_64-linux -o /usr/local/bin/tttool \
    && chmod +x /usr/local/bin/tttool

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
