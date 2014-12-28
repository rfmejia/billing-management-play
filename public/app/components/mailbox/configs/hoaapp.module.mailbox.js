var app = angular.module("module.mailbox", [
    "ui.bootstrap",
    "ui.router",
    "hoaControllers"]);

app.config(["$stateProvider", "$urlRouterProvider", 
    function($stateProvider, $urlRouterProvider) {
        var inbox = {
            url         : "/inbox",
            views       : {
                "contentArea@workspace"     : {
                    templateUrl         : "app/components/mailbox/views/maincontent-inbox.html",
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

