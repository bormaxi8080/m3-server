var helper = require('../../helper');
var ActionsCache = helper.require('cache/actionsCache.js');

describe('ActionsCache', function() {
    beforeEach(function() {

        this.actions = {
            action_1: {
                start_time: 1000,
                end_time: 3000,
                effects: {
                    products: {
                        tier_1: {
                            reward: {
                                real_balance: 120
                            }
                        }
                    },
                    booster_packs: {
                        pastry_tongs: {
                            price: {
                                real_balance: 5
                            }
                        },
                        gingerbread_man: {
                            contents: {
                                gingerbread_man: 1,
                                pastry_tongs: 1
                            }
                        }
                    },
                    invite: {
                        reward: {
                            real_balance: 10
                        }
                    },
                    life: {
                        price: {
                            real_balance: 30
                        }
                    },
                    unlocks: {
                        2: {
                            price: {
                                real_balance: 10
                            }
                        },
                        3: {
                            price: {
                                real_balance: 15
                            }
                        }
                    }
                }
            },
            action_2: {
                start_time: 2000,
                end_time: 4000,
                effects: {
                    products: {
                        tier_2: {
                            reward: {
                                real_balance: 130
                            }
                        }
                    }
                }
            },
            action_3: {
                start_time: 5000,
                end_time: 6000,
                effects: {
                    products: {
                        tier_1: {
                            reward: {
                                real_balance: 150
                            }
                        }
                    }
                }
            }
        }

        this.actionsCache = new ActionsCache();
        this.actionsCache.reserveInterval = 0;
        this.actionsCache.buildCache(this.actions);
    });

    describe("#makeIntervals", function() {
        it('returns ascendingly sorted array of timestamps', function() {
            this.actionsCache.makeIntervals(this.actions).should.deep.equal([0, 1000, 2000, 3000, 4000, 5000, 6000, Infinity]);
        });
    });

    describe("#getInterval", function() {
        it('returns valid interaval for action', function() {
            this.actionsCache.getInterval(2500).should.equal("2000_3000");
        });
    });

    describe("#getProductEffect", function() {
        it('returns accumulated product actions on actions intersecting', function() {
            this.actionsCache.getProductEffect("tier_1", 2500).should.deep.equal({
                reward: { real_balance: 120 }
            });

            this.actionsCache.getProductEffect("tier_2", 2500).should.deep.equal({
                reward: { real_balance: 130 }
            });
        });

        it('returns empty effect when no actions in progress', function() {
            this.actionsCache.getProductEffect("tier_1", 500).should.deep.equal({});
            this.actionsCache.getProductEffect("tier_1", 4500).should.deep.equal({});
            this.actionsCache.getProductEffect("tier_1", 10000).should.deep.equal({});
        });
    });

    describe("#getBoostersEffect", function() {
        it('returns accumulated product actions on actions intersecting', function() {
            this.actionsCache.getBoostersEffect("pastry_tongs", 2500).should.deep.equal({
                price: { real_balance: 5 }
            });

            this.actionsCache.getBoostersEffect("gingerbread_man", 2500).should.deep.equal({
                contents: {
                    gingerbread_man: 1,
                    pastry_tongs: 1
                }
            });
        });

        it('returns empty effect when no actions in progress', function() {
            this.actionsCache.getBoostersEffect("rainbow_cake", 500).should.deep.equal({});
            this.actionsCache.getBoostersEffect("rainbow_cake", 4500).should.deep.equal({});
            this.actionsCache.getBoostersEffect("rainbow_cake", 10000).should.deep.equal({});
        });
    });

    describe("#getUnlocksEffect", function() {
        it('returns accumulated product actions on actions intersecting', function() {
            this.actionsCache.getUnlocksEffect(2, 2500).should.deep.equal({
                price: { real_balance: 10 }
            });

            this.actionsCache.getUnlocksEffect(3, 2500).should.deep.equal({
                price: { real_balance: 15 }
            });
        });

        it('returns empty effect when no actions in progress', function() {
            this.actionsCache.getUnlocksEffect(2, 500).should.deep.equal({});
            this.actionsCache.getUnlocksEffect(2, 4500).should.deep.equal({});
            this.actionsCache.getUnlocksEffect(2, 10000).should.deep.equal({});
        });
    });

    describe("#getLifeEffect", function() {
        it('returns accumulated product actions on actions intersecting', function() {
            this.actionsCache.getLifeEffect(2500).should.deep.equal({
                price: { real_balance: 30 }
            });
        });

        it('returns empty effect when no actions in progress', function() {
            this.actionsCache.getLifeEffect(500).should.deep.equal({});
            this.actionsCache.getLifeEffect(4500).should.deep.equal({});
            this.actionsCache.getLifeEffect(10000).should.deep.equal({});
        });
    });

    describe("#getInviteEffect", function() {
        it('returns accumulated product actions on actions intersecting', function() {
            this.actionsCache.getInviteEffect(2500).should.deep.equal({
                reward: { real_balance: 10 }
            });
        });

        it('returns empty effect when no actions in progress', function() {
            this.actionsCache.getInviteEffect(500).should.deep.equal({});
            this.actionsCache.getInviteEffect(4500).should.deep.equal({});
            this.actionsCache.getInviteEffect(10000).should.deep.equal({});
        });
    });
});
