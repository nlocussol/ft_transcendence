#Node image from docker hub for development
FROM node:20-alpine

#install missing package for using npm 
RUN	apk add --update python3 make g++ \
&&	rm -rf /var/cache/apk/*

# specify the workdir inside cointainer
WORKDIR /usr/src/app

# copy the angular configuration
COPY package.json package-lock.json ./

# install dependences inside container && angular
RUN npm install
RUN npm install -g @angular/cli

# copy the all front end data
COPY . .

RUN npm run build

EXPOSE 4200

CMD [ "ng", "serve", "--host=0.0.0.0", "--port", "4200"]
