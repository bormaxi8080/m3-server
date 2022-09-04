FROM node:latest

RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys B97B0AFCAA1A47F044F244A07FCC7D46ACCC4CF8
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main" > /etc/apt/sources.list.d/pgdg.list


RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y postgresql-client-9.3 openjdk-7-jdk

WORKDIR /usr/src

RUN sh -c "curl http://apache-mirror.rbc.ru/pub/apache/flex/4.13.0/binaries/apache-flex-sdk-4.13.0-bin.tar.gz|tar xz"

ENV FLEX_SDK_HOME /usr/src/apache-flex-sdk-4.13.0-bin

RUN mkdir -p $FLEX_SDK_HOME/frameworks/libs/player/11.1 && curl http://download.macromedia.com/get/flashplayer/updaters/11/playerglobal11_1.swc > $FLEX_SDK_HOME/frameworks/libs/player/11.1/playerglobal.swc

ADD . /usr/src/app

WORKDIR /usr/src/app/server

ENV NODE_ENV test

# install your application's dependencies
RUN npm install -g jake
RUN npm install

WORKDIR /usr/src/app/

RUN cp -vf server/config/development.yml server/config/${NODE_ENV}.yml

RUN jake flash:compile

WORKDIR /usr/src/app/server

# # replace this with your application's default port
EXPOSE 4000

# # replace this with your main "server" script file
CMD bash ./bootstrap.sh

