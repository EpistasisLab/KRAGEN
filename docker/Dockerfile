FROM python:3.10-slim
ARG docker_files=docker
WORKDIR /usr/src/app

# WORKDIR /app
# COPY src/*.py .

COPY ${docker_files}/requirements.txt requirements.txt
RUN apt update --fix-missing \
    && apt upgrade -y \
    && apt install -y gcc python3-dev \
    && pip install --upgrade pip \
    && pip install -r requirements.txt

ENTRYPOINT [ "python", "/usr/src/app/kragen.py" ]
