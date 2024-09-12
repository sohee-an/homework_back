FROM node:18.14.2 AS builder
RUN mkdir -p /app
WORKDIR /app
ADD . .
RUN mkdir -p video-storage

RUN npm uninstall bcrypt
RUN npm install bcrypt
RUN npm install
RUN npm run build



ARG JWT_SECRET
ENV JWT_SECRET ${JWT_SECRET}
ARG PORT
ENV PORT ${PORT}
ARG STAGE
ENV STAGE ${STAGE}

ARG AWS_S3_ACCESS_KEY
ENV AWS_S3_ACCESS_KEY ${AWS_S3_ACCESS_KEY}
ARG AWS_S3_SECRET_KEY ${AWS_S3_SECRET_KEY}
ARG AWS_S3_REGION ${AWS_S3_REGION}
ARG AWS_S3_BUCKET_NAME ${AWS_S3_BUCKET_NAME}

# EXPOSE 8080

CMD npm run typeorm migration:run;npm run start:prod