module.exports = function() {
    var has_one_key = function(value) {
        return Object.keys(value).length;
    };

    var is_natural = function(value) {
        return (typeof value === 'number') &&
                value >= 0 && value % 1 === 0;
    };

    var in_set = function(array) {
        return {
            check_key: function(key) {
                return array.indexOf(key) >= 0;
            }
        };
    };

    var colors = ["blue", "red", "yellow", "orange", "green", "pink", "bw"];
    var blockers = ["skylight", "honey", "vienna_waffle", "jelly", "chocolate"];
    var special_pieces = ["pastry_bag", "rainbow_cupcake", "spatula", "teapot"];
    var ingredients = ["blueberry", "raspberry", "strawberry", "physalis"];
    var boosters = [
        "pastry_tongs", "gingerbread_man", "confectionery_blade", "rainbow_cake", "pastry_bag", "reverse_move",
        "change_cakes_places", "extra_time", "striped_cake_on_plate", "cafetiere", "boss_protection", "extra_moves"
    ];

    var pieces = ['random'].concat(colors, special_pieces, ingredients);
    var powers = ['LINE_H', 'LINE_V', 'BLAST_3X3', 'SPATULA', '2', '3'];

    var rotations = [0, 1, 2, 3];

    this.type('color_map', {type: 'object'}, function() {
        this.each_key(in_set(colors), {type: 'uint'});
    });

    this.optional_key('extratime', {type: 'uint'});

    this.key('limit', {type: 'object'}, function() {
        this.assert('has_one_key', has_one_key);
        this.optional_key('time', {type: 'uint'});
        this.optional_key('moves', {type: 'uint'});
        this.other_keys_restricted();
    });

    this.key('background', {type: 'string'});
    this.key('objectives', {type: 'object'}, function() {
        this.optional_key('clearbacks', {type: 'boolean'});
        this.optional_key('get_colors', {type: 'array'}, function() {
            this.each_index({type: 'object'}, function() {
                this.key('piece', {type: 'string', in_set: pieces});
                this.optional_key('power', {type: 'string', in_set: powers});
                this.key('count', {type: 'uint'});
                this.other_keys_restricted();
            });
        });
        this.optional_key('toys', {type: 'boolean'});
        this.optional_key('get_ingredients', {type: 'object'}, function() {
            this.key('max_in_field', {type: 'uint'});
            this.key('spawn_delay', {type: 'uint'});
            this.key('ingredients', {type: 'object'}, function() {
                this.each_key(in_set(ingredients), {type:'uint'});
            });
            this.other_keys_restricted();
        });
        this.optional_key('glass', {type: 'uint'});
        this.other_keys_restricted();
    });
    this.optional_key('boss', {type: 'object'}, function() {
        this.key('spawn_delay', {type: 'uint'});
        this.key('blockers', {type: 'object'}, function() {
            this.each_key(in_set(blockers), {type:'uint'});
        });
        this.other_keys_restricted();
    });
    this.optional_key('toys', {type: 'array'}, function() {
        this.each_index({type: 'object'}, function() {
            this.key('id', {type: 'string'});
            this.key('rotation', {type: 'uint', in_set: rotations});
            this.other_keys_restricted();
        });
    });
    this.optional_key('rewards', {type: 'array'}, function() {
        this.each_index({type: 'object'}, function() {
            this.optional_key('game_balance', {type: 'uint'});
            this.optional_key('real_balance', {type: 'uint'});
            this.optional_key('boosters', {type: 'object'}, function() {
                this.each_key(in_set(boosters), {type:'uint'});
            });
            this.other_keys_restricted();
        });
    });
    this.key('colors', {type: 'object'}, function() {
        this.key('easy', {type: 'color_map'});
        this.key('normal', {type: 'color_map'});
    });
    this.key('scores', {type: 'array'}, function() {
        this.each_index({type: 'uint'});
    });
    this.key('board', {type: 'object'}, function() {
        this.key('width', {type: 'uint'});
        this.key('height', {type: 'uint'});
        this.other_keys_restricted();
    });
    this.key('cells', {type: 'array'}, function() {
        this.each_index({type: 'object'}, function() {
            this.key('x', {type: 'uint'});
            this.key('y', {type: 'uint'});
            this.optional_key('dest_x', {type: 'uint'});
            this.optional_key('dest_y', {type: 'uint'});

            this.optional_key('piece', {type: 'string', in_set: pieces});
            this.optional_key('power', {type: 'string', in_set: powers});
            this.optional_key('blocker', {type: 'string', in_set: blockers});
            this.optional_key('rotation', {type: 'uint', in_set: rotations});
            this.optional_key('color', {type: 'string', in_set: colors});
            this.optional_key('back', {type: 'uint', in_set: [1, 2]});
            this.optional_key('disabled', {type: 'boolean'});
            this.optional_key('spawn', {type: 'boolean'});
            this.optional_key('ingredient_target', {type: 'boolean'});
            this.optional_key('toy', {type: 'uint'});
            this.optional_key('count', {type: 'uint'});
            this.optional_key('max', {type: 'uint'});
            this.optional_key('reward', {type: 'uint'});
            this.other_keys_restricted();
        });
    });
    this.other_keys_restricted();
};
