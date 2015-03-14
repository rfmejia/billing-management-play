/**
 * Created by juancarlos.yu on 2/28/15.
 */
angular
    .module("module.directives", [
               "nvl-directives"
            ])
    .config(directiveConfig);

directiveConfig.$inject = ["$logProvider"];
function directiveConfig($logProvider) {
    $logProvider.debugEnabled(true);
}