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
            templateUrl: 'app/components/shared/elements/validated-form.html',
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
        templateUrl: 'app/components/shared/elements/alert.html',
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
                return (new Number(parseFloat(value)) || '$');
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


/**
 * Directives for the comment section. Has an optional current label when this is the most latest. set is-current="true" inside the html. To be used with .comment-list for stylings
 */
hoaDirectives.directive('hoaComments', function () {
    return {
        restrict: 'E',
        replace: true,
        transclude: false,
        scope: {
            isCurrent: "=",
            user: "=",
            timestamp: "=",
            comment: "="
        },
        template: '<article class="row">' +
        '<div class="col-md-12 col-sm-12">' +
        '<div ng-hide="comment == null" class="panel panel-default">\n    <div class="panel-heading right" ng-show="isCurrent ===true">Current</div>\n    <div class="panel-body">\n        <header>\n            <div class="comment-iconified comment-user"><i class="text-accented fa fa-user"></i>{{user}}</div>\n            <div class="comment-iconified comment-date"><i class="fa fa-clock-o"></i>{{timestamp}}</div>\n        </header>\n        <div class="comment-post">\n            <p>{{comment}}</p>\n        </div>\n    </div>\n</div>' +
        '</div>' +
        '</article>'
    };
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
                    ? element.addClass(active)
                    : element.removeClass(active);
            });
        }
    }
});


hoaDirectives.directive('nooovleError', function () {
    return {
        restrict: 'E',
        template: '<script type="text/ng-template" id="nooovle-error">\n    <span ng-message="required" class="text-danger">This is required</span>\n    <span ng-message="number" class="text-danger">Oops! Numbers only please.</span>\n    <span ng-message="min" class="text-danger">Positive numbers only</span>\n    <span ng-message="date" class="text-danger">Invalid date format. Please use the date picker</span>\n    <span ng-message="email" class="text-danger">Please enter a valid-email address</span>\n</script>'
    }
});