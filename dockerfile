FROM node as build

WORKDIR /var/www/MLCity_frontend

COPY . .

RUN npm install
RUN export NODE_OPTIONS="--max-old-space-size=8192"
RUN npm run build-test


FROM nginx:latest

COPY --from=build  /var/www/MLCity_frontend/www /usr/share/nginx/html
COPY docker/nginx/ /etc/nginx/conf.d/

