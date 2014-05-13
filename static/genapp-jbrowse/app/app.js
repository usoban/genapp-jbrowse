'use strict';

var jbrowse = angular.module('jbrowse', ['ngRoute', 'ngGrid', 'genjs.services', 'gencloud.services', 'genjs.table', 'jbrowse.controllers']);

jbrowse.config(['$routeProvider', function ($routeProvider) {

   var resolveProject = ['resolveProject', function (resolveProject) { return resolveProject(); }];

    $routeProvider.when('/', {
        templateUrl: '/static/genapp-jbrowse/partials/jbrowse.html',
        controller: 'JBrowseCtl',
        resolve: { _project: resolveProject },
        reloadOnSearch: false
    }).otherwise({
        redirectTo: '/'
    });
}]);

jbrowse.config(['$httpProvider', function ($httpProvider) {
    // Adds a csrftoken to all http requests.
    $httpProvider.defaults.headers.common['X-CSRFToken'] = $.cookie('csrftoken');
}]);