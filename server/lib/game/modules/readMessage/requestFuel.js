module.exports = function(message) {
    this.addOutgoing(message.from_user_id, 'fuel', {chapter_id: message.params.chapter_id});
};
