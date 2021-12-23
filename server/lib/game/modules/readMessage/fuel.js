module.exports = function(message) {
    var chapter = this.state.chapter.getLockedChapter();
    if (chapter && message.params.chapter_id == chapter.id) {
        this.state.chapter.addUnlocks(chapter.id, [message.from_user_id]);
    }
};
