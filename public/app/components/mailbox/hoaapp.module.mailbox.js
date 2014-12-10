var app = angular.module("module.mailbox", [
    "ui.bootstrap",
    "ui.router",
    "hoaServices",
    "hoaControllers"]);

app.config(["$stateProvider", "$urlRouterProvider", 
    function($stateProvider, $urlRouterProvider) {
        var inbox = {
            url         : "/inbox",
            views       : {
                "contentArea@workspace"     : {
                    templateUrl         : "app/components/mailbox/maincontent-inbox.html",
                    controller          : "inboxController"
                }
            } 
        };

        var pending = {
            url         : "/pending",
            views       : {
                "contentArea@workspace"     : {
                    template    : "pending"
                }
            }
        };

        var delivered = {
            url         : "/delivered",
            views       : {
                "contentArea@workspace"     : {
                    template    : "delivered"
                }
            }
        };

        $stateProvider
            .state("workspace.inbox",       inbox)
            .state("workspace.delivered",   delivered)
            .state("workspace.pending",     pending);
    }]);

