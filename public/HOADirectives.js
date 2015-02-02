var hoaDirectives = angular.module("hoaApp");

hoaDirectives.directive('dynamicName', ["$compile", "$parse", function ($compile, $parse) {
    return {
        restrict: 'A',
        terminal : true,
        priority : 100000,
        link: function (scope, elem) {
            var name = $parse(elem.attr("dynamic-name"))(scope);
            elem.removeAttr("dynamic-name");
            elem.attr("name" , name);
            $compile(elem)(scope);        
        }
    };
}]);

hoaDirectives.directive('validatedForm',[
    function(){
        return {
                restrict    : 'E',
                scope       : {
                    element     : '='
                },
                templateUrl : 'app/components/shared/elements/validated-form.html',
                replace     : false,
                transclude  : true
            };
    }]);

hoaDirectives.directive("hoaAlert", function () {
     return {
        restrict    : 'E',
        scope       : {
            title       : '@',
            description : '@',
            isDanger    : '='
        },
        templateUrl : 'app/components/shared/elements/alert.html',
        replace     : false
     };
 });