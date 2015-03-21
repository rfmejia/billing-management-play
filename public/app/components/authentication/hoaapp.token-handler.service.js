angular
    .module('app.authentication')
    .factory("tokenHandler", tokenHandler);

function tokenHandler() {
    var tokenHandler = {
        set         : set,
        get         : get,
        wrapActions : wrapActions
    };

    var token = "none";

    return tokenHandler;

    function tokenWrapper(resource, action) {
        resource['_' + action] = resource[action];
        //create new action wrapping the original + sending token
        resource[action] = function(data, success, error) {
            return resource['_' + action](
                // call action with provided data and
                // appended access_token
                angular.extend({}, data || {},
                               {"X-Auth-Token" : tokenHandler.get()}),
                success,
                error
            );
        }
    }

    function set(newToken) {
        token = newToken;
    }

    function get() {
        return token;
    }

    function wrapActions(resource, actions) {
        //copy of resource
        var wrappedResource = resource;

        //loop through actions and wrap them
        for (var i = 0; i < actions.length; i++) {
            tokenWrapper(wrappedResource, actions[i]);
        }

        //return modified resource
        return wrappedResource;
    }
}
tokenHandler.$inject = [];
