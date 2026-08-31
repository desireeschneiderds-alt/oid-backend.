FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    cabal-install \
    ghc \
    alex \
    happy \
    libgmp-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /root/.cabal/packages/hackage.haskell.org \
    && curl -fL https://hackage.haskell.org/root.json -o /root/.cabal/packages/hackage.haskell.org/root.json \
    && cabal update \
    && cabal install tttool

ENV PATH="/root/.cabal/bin:${PATH}"

RUN apt-get update && apt-get install -y nodejs npm

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
