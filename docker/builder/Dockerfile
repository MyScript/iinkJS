FROM debian:bullseye-slim
ENV DEBIAN_FRONTEND noninteractive
RUN apt update -yyq;
RUN apt install make npm yarn git curl -yyq
RUN curl -fsSL https://get.docker.com -o get-docker.sh && sh ./get-docker.sh
