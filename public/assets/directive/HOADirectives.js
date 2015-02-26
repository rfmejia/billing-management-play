var hoaDirectives = angular.module("hoaApp");

hoaDirectives.directive('dynamicName', ["$compile", "$parse", function ($compile, $parse) {
    return {
        restrict: 'A',
        terminal: true,
        priority: 100000,
        link: function (scope, elem) {
            var name = $parse(elem.attr("dynamic-name"))(scope);
            elem.removeAttr("dynamic-name");
            elem.attr("name", name);
            $compile(elem)(scope);
        }
    };
}]);

hoaDirectives.directive('validatedForm', [
    function () {
        return {
            restrict: 'E',
            scope: {
                element: '='
            },
            templateUrl: '../../app/components/shared/elements/validated-form.html',
            replace: false,
            transclude: true
        };
    }]);

hoaDirectives.directive("hoaAlert", function () {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            description: '@',
            isDanger: '='
        },
        templateUrl: '../../app/components/shared/elements/alert.html',
        replace: false
    };
});

hoaDirectives.directive('ignoreMouseWheel', function ($rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('mousewheel', function (event) {
                element.blur();
            });
        }
    }
});

hoaDirectives.directive('numberValid', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {

            ctrl.$parsers.push(function (value) {
                if(value == null) {
                    console.log("null");
                    return (new Number(parseFloat("1")) || '$');;
                }
                else {
                    return (new Number(parseFloat(value)) || '$');
                }
            });
        }
    }
});

/**
 * Listener if our form changes validity
 */
hoaDirectives.directive('formWatcher', function () {
    return function (scope, element, attrs) {
        scope.$watch(attrs.name + '.$error', function () {

        }, true);
    }
});

hoaDirectives.directive('hoaActivate', function ($location) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var active = "active";
            var path = attrs.path;
            scope.$location = $location;
            scope.$watch('$location.path()', function (locationPath) {
                locationPath.search(path) != -1
                    ? element.addClass('active')
                    : element.removeClass('active');
            });
        }
    }
});

/**
 *
 */
hoaDirectives.directive('nooovleInputs', function() {
    return {
        restrict    : 'E',
        replace     : false,
        transclude  : false,
        scope : {
            field       : "=",
            parentForm  : "=",
            dateChangeCallback : "&",
            dateConfig         : "="
        },
        templateUrl: 'assets/directive/directive-nooovle-inputs.html'
    }
});

/**
 * Displays error messages. TODO: put the errors in a config file.
 */
hoaDirectives.directive('nooovleErrorMessages', function () {
    return {
        restrict: 'E',
        templateUrl: 'assets/directive/directive-nooovle-error-messages.html'
    }
});

hoaDirectives.directive('nooovleErrorBlock', function() {
    return {
        restrict    : 'E',
        scope       : {
            parentForm : '=',
            field      : '@',
            isRequired : '='
        },
        templateUrl : 'assets/directive/directive-nooovle-error-block.html'
    }
});

hoaDirectives.directive('removeFocus', function() {
    return {
        restrict : 'A',
        link: function postLink(scope, element, attrs) {
            element.bind('focus', function () {
                console.log('blur');
                element[0].blur();
            });
        }
    }
});


