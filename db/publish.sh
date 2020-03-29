#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/." # parent dir of scripts dir
cd "${DIR}"

IMAGE_NAME="gcr.io/jblewpl-kube/jblewplold-db"

docker build --no-cache -t "${IMAGE_NAME}:latest" .
docker push "${IMAGE_NAME}:latest"
