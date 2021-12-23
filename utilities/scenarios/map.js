module.exports = function(server, records) {
    var facebookNetwork = server.generateFacebookNetwork();

    var mapscreen = JSON.parse(server.getRequest("/map/mapscreen", {}));
    server.getRequest("/map/level?hash=" + mapscreen.chapters[0].levels[0].hash, {});
    server.getRequest("/map/chapter?hash=" + mapscreen.chapters[0].hash, {});
};
