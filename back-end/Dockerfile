#Node image from docker hub
FROM node:20-alpine

# specify the workdir inside cointainer
WORKDIR /usr/src/app

# copy the angular configuration
COPY package.json package-lock.json ./

# install dependences inside container
RUN npm ci

# copy the all front end data
COPY . .

RUN npm run build

EXPOSE 3000