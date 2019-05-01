# Stage 0, "build-stage", based on Node.js, to build and compile Angular
FROM node:lts-alpine as build-stage

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm install


# add app
COPY . /usr/src/app

ARG configuration=production
RUN npm run build -- --output-path=./dist/out --configuration $configuration


# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15
COPY --from=build-stage /usr/src/app/dist/out/ /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf



# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
# FROM nginx:stable-alpine
# COPY dist/* /usr/share/nginx/html
# COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf
