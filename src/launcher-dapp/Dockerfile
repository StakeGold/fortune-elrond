# =========
# LOCAL DEV
# =========
FROM node:18-alpine3.16 as development

WORKDIR /usr/src/app

# ADD BUILD DEPS
RUN apk add libusb-dev &&\
    apk add linux-headers &&\
    apk add eudev-dev &&\
    apk add pkgconfig &&\
    apk add python3 make gcc g++

# Install app dependencies using the `npm ci` command instead of `npm install`
COPY package*.json ./
RUN npm install &&\
    npm install -g serve &&\
    npm install --save webpack-dev-server

# Bundle app source
COPY . .

RUN npm run build

EXPOSE 3001

RUN npm run build

ENTRYPOINT [ "serve", "-s", "build" ]
