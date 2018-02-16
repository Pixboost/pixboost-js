FROM node:9.5.0-alpine

RUN mkdir /app
VOLUME /app

WORKDIR /app

CMD npm install --unsafe-perm