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

# Lade das offizielle v1.9 Linux-Release herunter und entpacke es
RUN curl -fL https://github.com/brouhaha/tttool/releases/download/v1.9/tttool-x86-64-linux-1.9.zip -o /tmp/tttool.zip \
    && unzip /tmp/tttool.zip -d /tmp/tttool_extracted \
    && mv /tmp/tttool_extracted/tttool-x86-64-linux-1.9/tttool /usr/local/bin/tttool \
    && chmod +x /usr/local/bin/tttool \
    && rm -rf /tmp/tttool*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
