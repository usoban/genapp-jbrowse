'use strict';
/**
 * ====
 * App
 * ====
 */

/**
 * .. js:class:: jbrowse
 *
 *      Base app declaration. Defines the imported modules and routing.
 *
 *      **URLS**:
 *
 *      * ``/`` - :js:func:`JBrowseController`
 *
 */
var jbrowse = angular.module('jbrowse', [
    'ngRoute', 'ngGrid', 'genjs.services', 'gencloud.services', 'genjs.table', 'ui.bootstrap', 'jbrowse.controllers',
    'jbrowse.services'
]);

jbrowse.config(['$routeProvider', function ($routeProvider) {

   var resolveInitProject = ['resolveInitialProject', function (resolveInitialProject) {
       return resolveInitialProject();
   }];

    $routeProvider.when('/', {
        templateUrl: '/static/genapp-jbrowse/partials/jbrowse.html',
        controller: 'JBrowseController',
        resolve: { _project: resolveInitProject },
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