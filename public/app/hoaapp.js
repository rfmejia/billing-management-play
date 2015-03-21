/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module('hoa-app', [
            /** Shared modules **/
                "app.providers",
                "app.core",
                "app.directives",
                "app.filters",
                "app.authentication",
            /** Feature areas **/
                "app.tenants",
                "app.mailbox",
                "app.reports",
                "app.layout"
            ]);
