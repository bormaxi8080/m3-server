var _s = require('underscore.string');
var GameLogicError = require('../gameLogicError.js');

MethodAccessorGenerator = module.exports = {};

MethodAccessorGenerator.injectDefAccessor = function(target, defName, humanName, defPath) {
    var capitalizedDefName = _s.capitalize(defName);

    var objectProp = defName + 'Prop';
    target[objectProp] = function(id) {
        return defPath + '.' + id;
    };

    var object = defName;
    target[object] = function(id) {
        return this.defs.get(this[objectProp](id));
    };

    var checkObjectDefined = 'check' + capitalizedDefName + 'Defined';
    target[checkObjectDefined] = function(id) {
        if (!this.defs.has(this[objectProp](id))) {
            throw new GameLogicError(humanName + " \"" + id + "\" is not defined");
        }
    };
};

MethodAccessorGenerator.injectStateAccessor = function(target, stateName, humanName, statePath, opts) {
    var capitalizedStateName = _s.capitalize(stateName);

    var objectStateProp = stateName + 'StateProp';
    target[objectStateProp] = function(id) {
        return statePath + '.' + id;
    };

    var objectState = stateName + 'State';
    if (opts && opts.default !== undefined) {
        target[objectState] = function(id) {
            return this.data.getOrDefault(this[objectStateProp](id, opts.default));
        };
    } else {
        target[objectState] = function(id) {
            return this.data.get(this[objectStateProp](id));
        };
    }

    var isObjectExists = 'is' + capitalizedStateName + 'Exists';
    if (opts && opts.default !== undefined) {
        target[isObjectExists] = function(id) { return true; };
    } else {
        target[isObjectExists] = function(id) {
            return this.data.has(this[objectStateProp](id));
        };
    }

    var checkObjectExists = 'check' + capitalizedStateName + 'Exists';
    target[checkObjectExists] = function(id) {
        if (!this[isObjectExists](id)) {
            throw new GameLogicError(humanName + " \"" + id + "\" does not exists in state");
        }
    };

    var checkObjectNotExists = 'check' + capitalizedStateName + 'NotExists';
    target[checkObjectNotExists] = function(id) {
        if (this[isObjectExists](id)) {
            throw new GameLogicError(humanName + " \"" + id + "\" already does exists in state");
        }
    };

    var setObjectState = 'set' + capitalizedStateName + 'State';
    target[setObjectState] = function(id, value) {
        return this.data.set(this[objectStateProp](id), value);
    };
};
