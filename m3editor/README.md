m3editor
========

Private tool for game designers. Current project struture:

    m3editor
    ├── Jakefile
    ├── README.md
    ├── deploy # configuration for deploying to produciton servers
    ├── editor # Flex editor application
    └── server # backend server

# Backend server

## Prerequisites

- Node 0.10 or newer
- PostgreSQL 9.1 or newer
- Flex SDK (for deployment and flash application compilation)
- Java (for deployment and flash application compilation)

## Installation

### Server environment

Server requires globally installed jake to execute configuration tasks.
Install required modules:

    $ cd server
    $ npm install
    $ npm install -g jake

Then initialize database. By default `server/config/development.yml` will be used

    $ jake db:recreate

### Flash compiler

For deployment and flash application compilation also following optional packages can be installed

- Download and extract [Flex SDK binaries](http://flex.apache.org/download-binaries.html), version 4.6 or newer
- Set env variable `$FLEX_SDK_HOME` to extracted binaries path
- Download [Flash Player 11.1 bindings](http://download.macromedia.com/get/flashplayer/updaters/11/playerglobal11_0.swc)
- Save downloaded file as `$FLEX_SDK_HOME/frameworks/libs/player/11.1/playerglobal.swc`

Use following command to test flash compilation:

    $ jake flash:compile

## Startup

Run server with following command. By default server will be accessible as http://127.0.0.1:4000/

    $ jake server:run

If flash compilation is set up, you can run full compilation with:

    $ jake

## User management

Since server has no register interface, there are come tasks to manipulate user directly
on database using jake tasks. They perform only minimal validation. Be ware.

Since jake is quite dumb console tool, please use only characters, numbers and underscore as
username and password symbols

#### Add user

Adds user to database, fails if user already exists

    $ jake db:user:add[john,SomeCr4zy_pass4someOne]

#### Update user passwort

Updates user password, fails if user does not exist

    $ jake db:user:update[john,new_simple_pass]

#### Delete user

Deletes user from database

    $ jake db:user:update[delete]

# Deploy

Server deployed via Capistrano, a ruby-based tool. All commands must be executed from path `deploy`
Use command `cap -T` to list all available tasks.

### Setting things up

Capistrano requires some installation before first run.

 - Install latest ruby (`2.1` or newer), preferably using `rvm` tool
 - `cd deploy && bundle install`
 - Ensure that you have proper access to deploy server as `ssh deploy@54.213.207.190`
 - Capistrano is ready for deployment


### Deploying new version

Capistrano deploy latest commit from your current git branch. Deploy command:

    $ cd deploy && cap production deploy

### Managing remote server users

It has some implemented tasks, based on jake tasks, described earlier. Following commands are valid:

    $ cap user:add
    $ cap user:update
    $ cap user:delete

All required data(username, password) will be prompted directly on execution
