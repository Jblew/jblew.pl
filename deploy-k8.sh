#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/." # parent dir of scripts dir
cd "${DIR}"

kubectl apply --namespace jblewpl-old -f db/k8.yml -f web/k8.yml
