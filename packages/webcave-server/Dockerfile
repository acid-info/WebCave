FROM node:18
WORKDIR /usr/src/app

COPY . .

RUN yarn
RUN yarn build

EXPOSE 3001

WORKDIR /usr/src/app/packages/webcave-server
RUN [ "chmod","+x", "./docker-entrypoint.sh" ]
ENTRYPOINT [ "./docker-entrypoint.sh" ]