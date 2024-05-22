FROM python:3.10-slim AS builder
ARG docker_files=docker/setup
WORKDIR /app

COPY ${docker_files}/requirements.txt requirements.txt

RUN apt update --fix-missing \
    && apt upgrade -y \
    && apt install -y gcc python3-dev \
    && pip install --upgrade pip \
    && pip install -r requirements.txt

FROM python:3.10-slim
WORKDIR /app

COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY src/ /app/

ENTRYPOINT [ "python", "src/kragen.py" ]
