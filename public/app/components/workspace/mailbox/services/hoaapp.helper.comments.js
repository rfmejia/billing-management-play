/**
 * Created by juancarlos.yu on 2/25/15.
 */
angular
    .module("module.mailbox")
    .factory('helper.comments', [
        'service.hoacurrentuser',
        'moment',
        commentParser
    ]);

function commentParser(hoacurrentuser, moment) {
    var dateFormat = 'MMM-DD-YY HH:mm';

    var parser = {
        parseComments : parseComments
    };

    return parser;

    function parseComments(currentComment, previous) {
        var comments = {};
        var recentComment = {};
        if (typeof previous !== 'undefined' && previous.length > 0) {
            previous[0].profile = 'list-item';
        }
        if(currentComment != null && currentComment.trim().length > 0) {
            comments.hasRecent = true;
            recentComment.profile = 'list-item-special';
            recentComment.userName = hoacurrentuser.getUserDetails().fullName;
            recentComment.timestamp = moment();
            recentComment.comment = currentComment;
            previous.unshift(recentComment);
        }
        else {
            comments.hasRecent = false;
        }
        comments.all = previous;
        return comments;
    }
}