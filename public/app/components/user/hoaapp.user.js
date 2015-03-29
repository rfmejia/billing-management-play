/**
 * Created by juancarlos.yu on 3/26/15.
 */
angular.module("app.user").factory("User", userCreator);

function userCreator() {
    /**
     *  Constructor, with class name
     */

    function User(data) {
        //Public properties, assigned to the instance this
        this.fullName = data.fullName;
        this.email = data.email;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.userId = data.userId;
        this.roles = data.roles;
    }

    /**
     * Public functions for prototypes
     */

    User.prototype.isAdmin = function() {
        return this.roles.indexOf("admin") !== -1;
    };

    User.prototype.isApprover = function() {
        return this.roles.indexOf("approver") !== -1;
    };

    User.prototype.isChecker = function() {
        return this.roles.indexOf("checker") !== -1;
    };

    User.prototype.isEncoder = function() {
        return this.roles.indexOf("encoder") !== -1;
    };

    /**
     * Private functions
     */


    /**
     * Static functions
     */

    User.build = function(data) {
        return new User(data);
    };

    return User;
}