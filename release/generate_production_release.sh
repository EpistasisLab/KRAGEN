#! /bin/bash

source .env
echo "tag: $TAG"

docker compose -f docker-compose-prod.yml build

docker tag kragen_convert:${TAG} moorelab/kragen:${TAG}