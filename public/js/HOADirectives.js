var hoaDirectives = angular.module("hoaDirectives", []);

hoaDirectives.directive('dynamicName', ["$compile", "$parse", function ($compile, $parse) {
    return {
        restrict: 'A',
        terminal : true,
        priority : 100000,
        link: function (scope, elem) {
            var name = $parse(elem.attr("dynamic-name"))(scope);
            console.log(name);
            elem.removeAttr("dynamic-name");
            elem.attr("name" , name);
            $compile(elem)(scope);        
        }
    };
}]);