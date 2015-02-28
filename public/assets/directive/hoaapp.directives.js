/**
 * Created by juancarlos.yu on 2/28/15.
 */
angular
    .module("module.directives", [])
    .config([
        "$logProvider",
        directiveConfig
    ]);

function directiveConfig($logProvider) {
    $logProvider.debugEnabled(true);
}