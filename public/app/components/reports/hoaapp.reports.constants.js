/**
 * Created by juancarlos.yu on 3/15/15.
 */
angular
    .module("app.reports")
    .constant("REPORTS_ROUTES", {
                  report       : "workspace.reports",
                  reportUpdate : "workspace.reports.view"
              })
    .constant("REPORTS_QUERY_KEY", {
                 month : "month",
                 year  : "year"
              });


