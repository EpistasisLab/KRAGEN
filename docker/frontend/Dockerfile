FROM node:lts-bookworm-slim

ARG BASE_DIR=KRAGEN_Dashboard/Frontend

WORKDIR /app

COPY ${BASE_DIR} /app

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]