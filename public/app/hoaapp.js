/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module('hoa-app', [
            /** Shared modules **/
                "module.providers",
                "module.core",
                "module.directives",
                "module.filters",
                "module.authentication",
            /** Feature areas **/
                "module.tenants",
                "module.mailbox",
                "module.reports",
                "module.layout"
            ]);
