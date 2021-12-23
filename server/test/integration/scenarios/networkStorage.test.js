var _ = require('lodash');
var clone = require('node-v8-clone').clone;
var helper = require('../helper');
var server = require('../lib/server').byId('local');

describe('Network storage', function() {
    describe('/storage/ensure', function() {
        context('with unstorageble network', function() {
            it('should return error', function() {
                var response = server.postRequest('/storage/get', {
                    client_network: server.generateDeviceNetwork()
                });
                response.should.have.property('error');
            });
        });

        context('with correct network', function() {
            beforeEach(function() {
                this.network = server.generateNetwork('FB', '199');
                this.firstReponse = server.postRequest('/storage/get', {
                    client_network: this.network
                });
            });

            it('return session and storage id', function() {
                this.firstReponse.should.not.have.property('error');
                this.firstReponse.should.have.property('session');
                this.firstReponse.should.have.property('storage');
            });

            context('on repeative call', function() {
                beforeEach(function() {
                    this.secondResponse = server.postRequest('/storage/get', {
                        client_network: this.network
                    });
                });

                it('invalidates old storage sesion', function() {
                    this.firstReponse.storage.should.not.equal(this.secondResponse.storage);
                });

                it('keeps exising user session', function() {
                    this.firstReponse.session.should.equal(this.secondResponse.session);
                });
            });
        });
    });

    describe('/storage/fetch', function() {
        beforeEach(function() {
            this.network = server.generateNetwork('FB', '199');
            this.storage = server.postRequest('/storage/get', {
                client_network: this.network
            });
        });

        context('with valid storage session', function() {
            beforeEach(function() {
                this.data = {data: {hello: 'world'}};
                server.postRequest('/storage/store', _.extend(clone(this.storage), this.data));
            });

            it('receives stored data', function() {
                this.fetchedData = server.postRequest('/storage/fetch', this.storage);
                this.fetchedData.should.deep.equal(this.data);
            });
        });

        context('with outdated storage session', function() {
            beforeEach(function() {
                this.secondStorage = server.postRequest('/storage/get', {
                    client_network: this.network
                });
            });

            it('returns storage error', function() {
                this.fetchRequest = server.postRequest('/storage/fetch', this.storage);
                this.fetchRequest.should.have.property('error');
                this.fetchRequest.error.should.equal("incorrect_storage");
            });
        });
    });

    describe('/storage/store', function() {
        beforeEach(function() {
            this.network = server.generateNetwork('FB', '199');
            this.storage = server.postRequest('/storage/get', {
                client_network: this.network
            });
        });

        context('with valid storage session', function() {
            it('returns not errors', function() {
                this.storeRequest = server.postRequest('/storage/store', _.extend(clone(this.storage), {data: {}}));
                this.storeRequest.should.not.have.property('error');
            });
        });

        context('with outdated storage session', function() {
            beforeEach(function() {
                this.secondStorage = server.postRequest('/storage/get', {
                    client_network: this.network
                });
            });

            it('returns storage error', function() {
                this.storeRequest = server.postRequest('/storage/store', _.extend(clone(this.storage), {data: {}}));
                this.storeRequest.should.have.property('error');
                this.storeRequest.error.should.equal("incorrect_storage");
            });
        });
    });
});
