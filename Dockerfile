FROM node:14.8-alpine

# build server
WORKDIR /app
COPY ./server .
RUN yarn install

# build client
WORKDIR /app/client
COPY ./client .
RUN yarn install
RUN yarn run build

# run
WORKDIR /app
EXPOSE 4000
CMD yarn start
