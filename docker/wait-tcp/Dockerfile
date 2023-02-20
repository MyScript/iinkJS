FROM debian:buster-slim
ENV DEBIAN_FRONTEND noninteractive

RUN apt update -yy;apt install -yy curl jq netcat-openbsd;rm -rf /var/lib/apt/* /var/cache/apt/*

ENV WAIT_SERVICE "Undef"
ENV WAIT_PORT 80
ENV WAIT_HOST WAITHOST
ENV TIMEOUT 90
ENV DEBUG false
ADD /entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
