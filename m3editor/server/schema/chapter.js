module.exports = function() {
    this.key('levels', {type: 'array'}, function() {
        this.each_index({type: 'object'}, function() {
            this.key('default', {type: 'uint'});
            this.each_key(this.any(), {type: 'uint'});
        });
    });
    this.optional_key('bonus_level', {type: 'object'},function() {});
    this.other_keys_restricted();
};
