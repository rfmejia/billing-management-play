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

hoaDirectives.directive( 'ignoreMouseWheel', function( $rootScope ) {
    return {
        restrict: 'A',
        link: function( scope, element, attrs ){
            element.bind('mousewheel', function ( event ) {
                element.blur();
            } );
        }
    }
} );

hoaDirectives.directive('numberValid', function() {
    return {
        require : 'ngModel',
        link    : function(scope, elem, attrs, ctrl) {

            ctrl.$parsers.push(function(value) {
                return (new Number(parseFloat(value)) || '$');
            });
        }
    }
});

/**
 * Listener if our form changes validity
 */
hoaDirectives.directive('formWatcher', function() {
   return function(scope, element, attrs) {
       scope.$watch(attrs.name+'.$error', function() {

       }, true);
   }
});