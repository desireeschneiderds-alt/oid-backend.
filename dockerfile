FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    ca-certificates \
    libgmp10 \
    zlib1g \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fL https://github.com/brouhaha/tttool/releases/download/v1.9/tttool-1.9-x86_64-linux.zip -o /tmp/tttool.zip \
    && unzip /tmp/tttool.zip -d /tmp/ \
    && mv /tmp/tttool-1.9-x86_64-linux/tttool /usr/local/bin/tttool \
    && chmod +x /usr/local/bin/tttool \
    && rm -rf /tmp/tttool*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
