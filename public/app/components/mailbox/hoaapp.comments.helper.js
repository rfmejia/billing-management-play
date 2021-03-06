/**
 * Created by juancarlos.yu on 2/25/15.
 */
angular
    .module("app.mailbox")
    .factory("commentsHelper", commentParser);

function commentParser(hoacurrentuser, dateUtils) {
    var dateFormat = "MMM-DD-YY HH:mm";

    var parser = {
        parseComments : parseComments
    };

    return parser;

    function parseComments(currentComment, previous) {
        var comments = {};
        var recentComment = {};
        if(previous == null) {
            previous = {};
            previous.all = [];
        }
        if (previous.all.length > 0) {
            previous.all[0].profile = "list-item";
        }
        if(currentComment != null && currentComment.trim().length > 0) {
            comments.hasRecent = true;
            recentComment.profile = "list-item-special";
            recentComment.userName = hoacurrentuser.getUserDetails().fullName;
            recentComment.timestamp = dateUtils.stringTimeStamp();
            recentComment.comment = currentComment;
            previous.all.unshift(recentComment);
        }
        else {
            comments.hasRecent = false;
        }
        comments.all = previous.all;
        return comments;
    }
}
commentParser.$inject = ["userApi", "nvl-dateutils"];