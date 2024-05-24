FROM node:lts-bookworm-slim

WORKDIR /app/KRAGEN_Dashboard/Frontend

COPY . /app
COPY entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh
RUN apt-get update && apt-get install -y curl
RUN npm install

EXPOSE 3000

# CMD ["npm", "start"]
ENTRYPOINT ["sh", "/app/entrypoint.sh"]
