#!/usr/bin/env bash

set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [[ ${BRANCH} -ne "master" ]]; then
    echo "You must be on the master branch to deploy"
    exit 1
fi

npm ci
npm test

gsutil -h "Cache-Control: max-age=86400,public" cp -a public-read -z js dist/* gs://pixboost-libs/new-libs/
