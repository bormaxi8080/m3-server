var helper = require('../../helper');
var DataWrapper = helper.require('game/dataWrapper.js');
var AccessProtocolError = helper.require('accessProtocolError.js');

describe('DataWrapper', function() {
    beforeEach(function() {
        this.data = {a: {b: {c: 20, a: [10] } } };
        this.dataWrapper = new DataWrapper(this.data);
    });

    describe('#get', function() {
        it('returns value by exising path', function() {
            this.dataWrapper.get("a.b").should.equal(this.data.a.b);
            this.dataWrapper.get("a.b.c").should.equal(20);
        });

        it('throws on unexising path', function() {
            var self = this;
            (function() {
                self.dataWrapper.get("a.b.d");
            }).should.throw(AccessProtocolError);
        });
    });

    describe('#getOrDefault', function() {
        it('returns value by existing path', function() {
            this.dataWrapper.getOrDefault("a.b", {}).should.equal(this.data.a.b);
            this.dataWrapper.getOrDefault("a.b.c", 0).should.equal(20);
        });

        it('returns default value on unexisting path', function() {
            this.dataWrapper.getOrDefault("a.b.d", 0).should.equal(0);
        });
    });

    describe('#set', function() {
        it('set value by existing path', function() {
            var obj = {a: 2};
            this.dataWrapper.set("a.b", obj);
            this.dataWrapper.get("a.b").should.equal(obj);

            this.dataWrapper.set("a.b.c", 10);
            this.dataWrapper.get("a.b.c").should.equal(10);
        });

        context('when in readonly mode', function() {
            beforeEach(function() {
                this.dataWrapper = new DataWrapper(this.data, {readonly: true});
            });

            it('throws on any value', function() {
                var self = this;
                (function() {
                    self.dataWrapper.set("a.b.c", 10);
                }).should.throw(AccessProtocolError);
            });
        });
    });

    describe('#has', function() {
        it('returns true by existing path', function() {
            this.dataWrapper.has("a.b").should.equal(true);
            this.dataWrapper.has("a.b.c").should.equal(true);
        });

        it('returns false by unexisting path', function() {
            this.dataWrapper.has("a.b.d").should.equal(false);
        });

        it('throws on empty path', function() {
            var self = this;
            (function() {
                self.dataWrapper.has(null);
            }).should.throw(AccessProtocolError);
        });
    });

    describe('#inc', function() {
        it('inc value by existing path', function() {
            this.dataWrapper.inc("a.b.c", 10);
            this.dataWrapper.get("a.b.c").should.equal(30);
        });

        it('throws on unexisting path', function() {
            var self = this;
            (function() {
                self.dataWrapper.inc("a.b.d", 10);
            }).should.throw(AccessProtocolError);
        });

        it('throws on empty path', function() {
            var self = this;
            (function() {
                self.dataWrapper.inc(null, 1);
            }).should.throw(AccessProtocolError);
        });

        context('when in readonly mode', function() {
            beforeEach(function() {
                this.dataWrapper = new DataWrapper(this.data, {readonly: true});
            });

            it('throws on any value', function() {
                var self = this;
                (function() {
                    self.dataWrapper.inc("a.b.c", 10);
                }).should.throw(AccessProtocolError);
            });
        });
    });

    describe('#push', function() {
        it('push value to existing array', function() {
            this.dataWrapper.push("a.b.a", 11);
            this.dataWrapper.get("a.b.a").should.deep.equal([10, 11]);
        });

        it('throws on unexisting path', function() {
            var self = this;
            (function() {
                self.dataWrapper.push("a.b.d", 10);
            }).should.throw(AccessProtocolError);
        });

        it('throws on empty path', function() {
            var self = this;
            (function() {
                self.dataWrapper.push(null, 1);
            }).should.throw(AccessProtocolError);
        });

        it('throws on non-array object by path', function() {
            var self = this;
            (function() {
                self.dataWrapper.push("a.b.c", 11);
            }).should.throw(AccessProtocolError);
        });

        context('when in readonly mode', function() {
            beforeEach(function() {
                this.dataWrapper = new DataWrapper(this.data, {readonly: true});
            });

            it('throws on any value', function() {
                var self = this;
                (function() {
                    self.dataWrapper.push("a.b.a", 11);
                }).should.throw(AccessProtocolError);
            });
        });

    });
});
