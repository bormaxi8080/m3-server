#!/bin/bash


#REDIS_PORT_6379_TCP_ADDR
#REDIS_PORT_6379_TCP_PORT

echo "m3editor server initialization"
echo "0: create profiles"

cp -r ./config/development/ ./config/${NODE_ENV}

echo "---" > ./config/${NODE_ENV}/app.yml
echo "  port: 4000" >> ./config/${NODE_ENV}/app.yml
echo "  token_secret: \"gghdfuuw9oll;[-&66wtgg00091835gfbns76dferRREjqls,,cll;0,cnnsggsiwuwiiwhhfbdsfkhkhkjhkjiuoiueqeroiujfkb\"" >> ./config/${NODE_ENV}/app.yml
echo "  production: false" >> ./config/${NODE_ENV}/app.yml
echo "  cluster:" >> ./config/${NODE_ENV}/app.yml
echo "    host: \"127.0.0.1\"" >> ./config/${NODE_ENV}/app.yml
echo "    port: 50000" >> ./config/${NODE_ENV}/app.yml
echo "    reconnect: 10" >> ./config/${NODE_ENV}/app.yml
echo "  logger:" >> ./config/${NODE_ENV}/app.yml
echo "    app_name: \"m3\"">> ./config/${NODE_ENV}/app.yml
echo "    console:" >> ./config/${NODE_ENV}/app.yml
echo "      level: \"trace\"">> ./config/${NODE_ENV}/app.yml
echo "    file:" >> ./config/${NODE_ENV}/app.yml
echo "      level: \"error\"" >> ./config/${NODE_ENV}/app.yml
echo "      path: \"logs/server.log\"" >> ./config/${NODE_ENV}/app.yml
echo "  networks:" >> ./config/${NODE_ENV}/app.yml
echo "    device:" >> ./config/${NODE_ENV}/app.yml
echo "      authorize:" >> ./config/${NODE_ENV}/app.yml
echo "        secret: \"gFdsrte55UIEEWgsggagtq998joOQ\"" >> ./config/${NODE_ENV}/app.yml
echo "    FB:" >> ./config/${NODE_ENV}/app.yml
echo "      authorize:" >> ./config/${NODE_ENV}/app.yml
echo "        url: \"https://graph.facebook.com/me?access_token=<%= accessToken %>\"" >> ./config/${NODE_ENV}/app.yml
echo "    GC:" >> ./config/${NODE_ENV}/app.yml
echo "      authorize:" >> ./config/${NODE_ENV}/app.yml
echo "        secret: \"gFdsrte55UIEEWgsggagtq998joOQ\"" >> ./config/${NODE_ENV}/app.yml
echo "    MM:" >> ./config/${NODE_ENV}/app.yml
echo "      authorize:" >> ./config/${NODE_ENV}/app.yml
echo "        secret: \"e05aed76eb3dc74ad1ccfb2220fd50f9\"" >> ./config/${NODE_ENV}/app.yml
echo "    OK:" >> ./config/${NODE_ENV}/app.yml
echo "      authorize:" >> ./config/${NODE_ENV}/app.yml

echo "---" > ./config/${NODE_ENV}/db.yml
echo " shardable:" >> ./config/${NODE_ENV}/db.yml
echo "   db:" >> ./config/${NODE_ENV}/db.yml
echo "     common:" >> ./config/${NODE_ENV}/db.yml
echo "       user: \"postgres\"" >> ./config/${NODE_ENV}/db.yml
echo "       password: \"\"" >> ./config/${NODE_ENV}/db.yml
echo "       host: \"${POSTGRES_PORT_5432_TCP_ADDR}\"" >> ./config/${NODE_ENV}/db.yml
echo "       port: \"${POSTGRES_PORT_5432_TCP_PORT}\"" >> ./config/${NODE_ENV}/db.yml
echo "       pool:" >> ./config/${NODE_ENV}/db.yml
echo "         max: 10" >> ./config/${NODE_ENV}/db.yml
echo "   shards:" >> ./config/${NODE_ENV}/db.yml
echo "     shard_0:" >> ./config/${NODE_ENV}/db.yml
echo "       db: \"m3_development_0\"" >> ./config/${NODE_ENV}/db.yml
echo "       db_cfg: \"common\"" >> ./config/${NODE_ENV}/db.yml
echo "     shard_1:" >> ./config/${NODE_ENV}/db.yml
echo "       db: \"m3_development_1\"" >> ./config/${NODE_ENV}/db.yml
echo "       db_cfg: \"common\"" >> ./config/${NODE_ENV}/db.yml
echo " standalone:" >> ./config/${NODE_ENV}/db.yml
echo "   user: \"postgres\"" >> ./config/${NODE_ENV}/db.yml
echo "   password: \"\"" >> ./config/${NODE_ENV}/db.yml
echo "   host: \"${POSTGRES_PORT_5432_TCP_ADDR}\"" >> ./config/${NODE_ENV}/db.yml
echo "   port: \"${POSTGRES_PORT_5432_TCP_PORT}\"" >> ./config/${NODE_ENV}/db.yml
echo "   database: \"m3_development_extra\"" >> ./config/${NODE_ENV}/db.yml

echo "---" > config/${NODE_ENV}/redis.yml
echo "  host: \"$REDIS_PORT_6379_TCP_ADDR\"" >> config/${NODE_ENV}/redis.yml
echo "  port: $REDIS_PORT_6379_TCP_PORT" >> config/${NODE_ENV}/redis.yml

echo "---" > config/${NODE_ENV}/cluster.yml
echo "  http_port: 4100" >> config/${NODE_ENV}/cluster.yml
echo "  ws_port: 50000" >> config/${NODE_ENV}/cluster.yml
echo "  logger:" >> config/${NODE_ENV}/cluster.yml
echo "    app_name: \"m3cluster\"" >> config/${NODE_ENV}/cluster.yml
echo "    console:" >> config/${NODE_ENV}/cluster.yml
echo "      level: \"trace\"" >> config/${NODE_ENV}/cluster.yml
echo "    file:" >> config/${NODE_ENV}/cluster.yml
echo "      level: \"warn\"" >> config/${NODE_ENV}/cluster.yml
echo "      path: \"logs/cluster.log\"" >> config/${NODE_ENV}/cluster.yml
echo "  shedule:" >> config/${NODE_ENV}/cluster.yml
echo "    check_period: 30" >> config/${NODE_ENV}/cluster.yml

echo "1: probe database ${POSTGRES_PORT_5432_TCP_ADDR}:${POSTGRES_PORT_5432_TCP_PORT} m3editorserver_${NODE_ENV}"

DATABASE_EXISTS=$(psql -h ${POSTGRES_PORT_5432_TCP_ADDR} -p ${POSTGRES_PORT_5432_TCP_PORT} -U postgres -l | grep m3_development | wc -l)

if [ $DATABASE_EXISTS -eq 0 ]; then
    echo "Creating database"
    jake db:recreate
fi

if [ $NODE_ENV == "test" ]; then
	echo "2: run tests (jake test)"
    NO_COLORS=true jake test
else
    echo "2: run cluster server (jake server)"
    jake cluster &
    sleep 5

    echo "3: run application server (jake cluster)"
    jake server &
    # run sshd
    /usr/sbin/sshd -D
fi




