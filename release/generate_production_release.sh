#! /bin/bash

source .env
echo "tag: $TAG"

docker compose -f docker-compose.yml build

docker tag krag_convert:${TAG} moorelab/krag_convert:${TAG}