#!/bin/bash

source .env
echo "tag: $TAG"

echo "Pushing images to DockerHub"
docker push moorelab/kragen:${TAG}

git tag -fa "v${TAG}" -m "v${TAG}"
git push --tags