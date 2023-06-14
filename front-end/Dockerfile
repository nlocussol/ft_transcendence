#Node image from docker hub for development
FROM node:20-alpine AS development

# specify the workdir inside cointainer
WORKDIR /usr/src/app

# copy the angular configuration
COPY package.json package-lock.json ./

# install dependences inside container && angular
RUN npm install
RUN npm install -g @angular/cli
RUN npm install http-request

# copy the all front end data
COPY . .

RUN npm run build

EXPOSE 4200

CMD [ "ng", "serve", "--host=0.0.0.0", "--port", "4200"]
