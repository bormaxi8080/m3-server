var PathNode = function() {
    this.content = null;
    this.parent = null;
    this.children = {};
};

PathNode.prototype.addChild = function(name, child) {
    child.parent = this;
    this.children[name] = child;
};

PathNode.prototype.getChild = function(name) {
    return this.children[name];
};

PathNode.prototype.hasChild = function(name) {
    return (name in this.children);
};

var PathTree = module.exports = function() {
    this.root = new PathNode(null);
};

PathTree.prototype.addNode = function(path, content) {
    var names = path.split("/");
    var len = names.length;
    var node = this.root;

    for (var i = 0; i < len; i++) {
        var name = names[i];

        if (name.length === 0) continue;

        if (!node.hasChild(name)) {
            node.addChild(name, new PathNode());
        }

        node = node.getChild(name);
    }

    if (node.content) {
        throw new Error("This node of the tree is already registered!");
    }

    node.content = content;
};

PathTree.prototype.getNode = function(path) {
    var names = path.split("/");

    var len = names.length;
    var node = this.root;

    for (var i = 0; i < len; i++) {
        var name = names[i];

        // защита от путей типа "/" и "//"
        if (name.length === 0) continue;

        if (!node.hasChild(name)) break;

        node = node.getChild(name);
    }

    var content = node.content;
    while (node.parent && !content) {
        node = node.parent;
        content = node.content;
    }

    return content;
};
