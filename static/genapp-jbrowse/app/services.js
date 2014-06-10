'use strict';
/**
 * ========
 * Services
 * ========
 */

angular.module('jbrowse.services', ['ngResource', 'genjs.services'])
    .value('version', '0.1')

    .factory('resolveInitialProject', ['$q', '$route', 'Project', function ($q, $route, Project) {
        return function () {
            var deferred = $q.defer();
            Project.get({}, function (cases) {
                deferred.resolve(cases.objects[0] || {});
            }, function (reason) {
                var message = "An error occured, sorry";
                if (reason.status == 404)
                    message = "Project with this id was not found";
                else if (reason.status == 401)
                    message = "You do not have permission to view this case";
                notify({message: "An error occured, sorry", type: 'danger'});
                deferred.reject(message);
            });
            return deferred.promise;
        }
    }])
;
