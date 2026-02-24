FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y --no-install-recommends iverilog make && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /cpu
COPY . .

CMD ["make", "run"]
