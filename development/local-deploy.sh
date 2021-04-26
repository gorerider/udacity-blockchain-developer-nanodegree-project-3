#!/bin/bash

set -e
DIR=$(dirname "$0")
SCRIPT_DIR="$(cd $DIR && pwd)"
PROJECT_DIR=$(dirname "$SCRIPT_DIR")
PROJECT_NAME=$(basename "$PROJECT_DIR")
NODE_PORT=${2:-3000}
NODE_PORT_GANACHE=${3:-8545}
cd $PROJECT_DIR

docker rmi -f $PROJECT_NAME || true
docker build -t $PROJECT_NAME .

docker run \
    --rm \
    -it \
    -v $PROJECT_DIR:/app \
    -p 8844:8844 \
    -p $NODE_PORT:$NODE_PORT \
    -p $NODE_PORT_GANACHE:$NODE_PORT_GANACHE \
    --name $PROJECT_NAME $PROJECT_NAME sh