FROM haskell:8.10 AS builder

RUN cabal update
RUN git clone https://github.com/brouhaha/tttool.git /tmp/tttool \
    && cd /tmp/tttool \
    && cabal install --installdir=/build --overwrite-policy=always

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    libgmp10 \
    zlib1g \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/tttool /usr/local/bin/tttool
RUN chmod +x /usr/local/bin/tttool

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
