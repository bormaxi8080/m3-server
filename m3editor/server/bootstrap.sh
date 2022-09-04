#!/bin/bash


echo "m3editor server initialization"
echo "0: create profile"

echo "---" > ./config/test.yml
echo "  port: 4000" >> ./config/test.yml
echo "  db:" >> ./config/test.yml
echo "    user: \"postgres\"" >> ./config/test.yml
echo "    password: \"\"" >> ./config/test.yml
echo "    host: \"$POSTGRES_PORT_5432_TCP_ADDR\"" >> ./config/test.yml
echo "    port: \"$POSTGRES_PORT_5432_TCP_PORT\"" >> ./config/test.yml
echo "    database: \"m3editorserver_${NODE_ENV}\"" >> ./config/test.yml


echo "1: probe database ${POSTGRES_PORT_5432_TCP_ADDR}:${POSTGRES_PORT_5432_TCP_PORT} m3editorserver_${NODE_ENV}"

DATABASE_EXISTS=$(psql -h ${POSTGRES_PORT_5432_TCP_ADDR} -p ${POSTGRES_PORT_5432_TCP_PORT} -U postgres -l | grep m3editorserver_${NODE_ENV}  | wc -l)

if [ $DATABASE_EXISTS -eq 0 ]; then
    echo "Creating database"
    jake db:recreate
fi

echo "2: create client host config"

jake flash:config

echo "3: run application (app.js)"

jake server

