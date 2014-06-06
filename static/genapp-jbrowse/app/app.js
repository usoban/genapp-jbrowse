'use strict';

var jbrowse = angular.module('jbrowse', [
    'ngRoute', 'ngGrid', 'genjs.services', 'gencloud.services', 'genjs.table', 'ui.bootstrap', 'jbrowse.controllers'
]);

jbrowse.config(['$routeProvider', function ($routeProvider) {

   var resolveProject = ['resolveProject', '$route', function (resolveProject, $route) {
        $route.current.params.caseId = '537a027efad58d7bd5ab97c7'; //  hack. TODO
       return resolveProject();
   }];

    $routeProvider.when('/', {
        templateUrl: '/static/genapp-jbrowse/partials/jbrowse.html',
        controller: 'JBrowseCtl',
        resolve: { _project: resolveProject },
        reloadOnSearch: false
    });
    $routeProvider.otherwise({
        redirectTo: '/'
    });
}]);

jbrowse.config(['$httpProvider', function ($httpProvider) {
    // Adds a csrftoken to all http requests.
    $httpProvider.defaults.headers.common['X-CSRFToken'] = $.cookie('csrftoken');
}]);