FROM node:latest

RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys B97B0AFCAA1A47F044F244A07FCC7D46ACCC4CF8
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main" > /etc/apt/sources.list.d/pgdg.list

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y postgresql-client-9.3 openssh-server

RUN mkdir -p /var/run/sshd
RUN mkdir -p /root/.ssh
# install your application's dependencies
RUN npm install -g jake

# set environment
ENV NODE_ENV docker

# # replace this with your application's default port
EXPOSE 4000
EXPOSE 4100

# expose an ssh port
EXPOSE 22

ADD . /root/app

# copy ssh-public key
RUN cat /root/app/m3highload_ssh_key.pub >> /root/.ssh/authorized_keys

WORKDIR /root/app/server

RUN npm install

# # replace this with your main "server" script file
CMD bash ./bootstrap.sh

