Directives
===========

spinal-case for custom attributes (e.g. np-agg), camelCase for corresponding directives
implementing them (e.g. ngApp)

- ngApp (ng-app)
  This directive is used to flag the html element that Angular should consider to be the root element of our application. This gives application developers the freedom to tell Angular if the entire html page or only a portion of it should be treated as the Angular application.
- ngController (ng-controller)
  attaches a controller to the DOM at some point, e.g. ng-controller="PhoneListCtrl"
- ngRepeat (ng-repeat)
  repeater directive, e.g. ng-repeat="phone in phones"
- ngSrc (ng-src="{{ image }}")
  images.
- ngClick (ng-click="setImage(img)")
  on-click callback function setImage with argument img. Callback defined in $scope.


Expressions & binding
=========
https://docs.angularjs.org/guide/expression

- expression is JavaScript-like code snippet evaluated by angular in the context of the corrent model scope rather than within global scope (window),
- binding is denoted by double curly braces {{ expr }},
- continuous updates when the result of the expression evaluation changes,

Bootstrapping
==============
- bootstrapping automatically via ngApp directive,
- bootstrapping manually; three important things happen:
    - the dependency injector is created
    - the injector creates the root scope that will become the context for the model of our app,
    - angular compiles the DOM starting at the ngApp, processing any directives and bindings found along the way

Once app is bootstrapped, it will then wait for incoming browser events (e.g. mouse click, key press, incoming HTTP response) that
might change the model. Once such an event occurs, angular detects if it caused any model changes are found, angular will reflect them in the view by updating all of the affected bindings.

Controller
=============
- controller is a constructor function that takes $scope parameter,
- the ngController directive, located on the <body> tag, references the name of our controller,
- controller attaches the data to the $scope that was injected into our controller function.
  This scope is a prototypical descendant of the root scope that was created when the application was defined.
  This controller scope is available to all bindings located within the <body ng-controller="PhoneListCtrl"> tag

Scope
======
- glue between controller, model and view

Filtering, ordering with repeaters
====================
-  The filter function uses the query value to create a new array that contains only those records that match the query.
- When changes to the data model cause the repeater's input to change, the repeater efficiently updates the DOM to reflect the current state of the model.
- Binding the name of the input box to a variable of the same name in the data model, and keep the two in sync
  <input ng-model="query">
  ng-repeat="phone in phones | filter:query"
- ordering:
  <select ng-model="orderProp">
    <option value="name">Alphabetical</option>
    <option value="age">Newest</option>
  </select>
  ng-repeat="phone in phones | filter:query | orderBy:orderProp"

XHR & DI
==========
- to use a service in Angular, you simply declare the names of the dependencies you need as arguments to the controller's constructor function, as follows:

    mymodule.controller('MyCtrl', function ($scope, $http) {...}
- the names of arguments are significant, because the injector uses these to look up the dependencies,
- as a naming convention, Angular's built-in services, Scope methods and a few other Angular APIs have a $ prefix in front of the name; for minification: see https://docs.angularjs.org/tutorial/step_05
- the $ prefix is there to namespace Angular-provided services. To prevent collisions it's best to avoid naming your services and models anything that begins with a $

Routing
=============
- modifying routes via $routeProvider:

    myapp.config(['$routeProvider',
      function($routeProvider) {
        $routeProvider.
          when('/phones', {
            templateUrl: 'partials/phone-list.html',
            controller: 'PhoneListCtrl'
          }).
          when('/phones/:phoneId', {
            templateUrl: 'partials/phone-detail.html',
            controller: 'PhoneDetailCtrl'
          }).
          otherwise({
            redirectTo: '/phones'
          });
      }
    ]);

- controller (in a separate module):

    var phonecatControllers = angular.module('phonecatControllers', []);
    phonecatControllers.controller('PhoneListCtrl', ['$scope', '$http',
      function ($scope, $http) {
        $http.get('phones/phones.json').success(function(data) {
          $scope.phones = data;
        });

        $scope.orderProp = 'age';
      }]);
    phonecatControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams',
        function($scope, $routeParams) {
            $scope.phoneId = $routeParams.phoneId;
    }]);