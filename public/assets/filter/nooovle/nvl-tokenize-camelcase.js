/**
 * Created by juancarlos.yu on 3/16/15.
 */
angular.module("nvl.filters").filter("tokenizedCamel", function() {
   return function(input) {
       return input.charAt(0).toUpperCase() + input.substr(1).replace(/[A-Z]/g, ' $&');
   }
});
