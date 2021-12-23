var _ = require('lodash');
var URL = require("url");
var PathTree = require("./pathTree");

var Router = module.exports = function(defaultController, routes) {
    if (!defaultController) throw new Error("defaultRoute must not be null!");

    this.tree = new PathTree();
    this.defaultController = defaultController;
    if (routes) {
        this.routes(routes);
    }
};

Router.prototype.handle = function(task, callback) {
    var path = URL.parse(task.request.url).pathname;
    var controller = this.tree.getNode(path) || this.defaultController;
    controller.process(task, callback);
};

Router.prototype.route = function(path, controller) {
    if (!controller) {
        throw new Error("Controller is missing for path " + path);
    }
    this.tree.addNode(path, controller);
};

Router.prototype.routes = function(routes) {
    _.each(routes, function(controller, path) {
        this.route(path, controller);
    }, this);
};

Router.prototype.controller = function(path) {
    return this.tree.getNode(path);
};
