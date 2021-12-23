module.exports = function() {
    this.key('client', {type: 'object'}, function() {
        this.key('dialogs', {type: 'object'}, function() {
            this.each_key(this.any(), {type:'object'}, function() {
                this.key('character', {type: 'string', member_of: 'client.characters.names' });
                this.key('steps', {type: 'array'}, function() {
                    this.each_index({type: 'object'}, function() {
                        this.key('text', {type: 'string'});
                        this.key('emotion', {type: 'string', member_of: 'client.characters.emotions' });
                        this.other_keys_restricted();
                    });
                });
                this.other_keys_restricted();
            });
        });
    });
};
