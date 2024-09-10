FROM node:18.14.2 AS builder
RUN mkdir -p /app
WORKDIR /app
ADD . .
RUN mkdir -p video-storage

RUN npm uninstall bcrypt
RUN npm install bcrypt
RUN npm install
RUN npm run build

