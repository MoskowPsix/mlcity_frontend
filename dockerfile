FROM node:latest as build

WORKDIR /var/www/MLCity_frontend

COPY . .

RUN ls -a

RUN npm install
RUN npm run build-test

FROM nginx:latest

COPY --from=build  /var/www/MLCity_frontend/www /usr/share/nginx/html
COPY docker/nginx/ /etc/nginx/conf.d/

EXPOSE 80
