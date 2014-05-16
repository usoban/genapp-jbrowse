'use strict';

angular.module('jbrowse.controllers', [])
    .controller('JBrowseCtl', ['_project', '$scope', '$route', function (_project, $scope, $route) {
        var type = 'all'; // TODO

        // =====================================
        //      data table helper functions
        // =====================================
        var data_type = ('data:' + type).toLowerCase();
        var preFilter = ''; /*function(obj) {
            var objtype = obj.type;
            return (objtype.indexOf(data_type) === 0) ? true : false
        };*/

        $scope.project = _project;
        $scope.genOptions = {
            itemsByPage: 15,
            project: $scope.project,
            enableRowSelection: false
        };

        $scope.tableOptions = {
            itemsByPage: 15,
            project: _project,
            genId: 'datalist-' + type,
            filter: preFilter,
            multiSelect: false,
            showExport: true,
            showImport: true,
            selectedItems: $scope.selection
        };

        // =====================================
        //      JBrowse initialization
        // =====================================
        var JBrowse;
        require(['JBrowse/Browser', 'dojo/io-query', 'dojo/json' ], function (Browser,ioQuery,JSON) {
           // the initial configuration of this JBrowse
           // instance

           // NOTE: this initial config is the same as any
           // other JBrowse config in any other file.  this
           // one just sets defaults from URL query params.
           // If you are embedding JBrowse in some other app,
           // you might as well just set this initial config
           // to something like { include: '../my/dynamic/conf.json' },
           // or you could put the entire
           // dynamically-generated JBrowse config here.

           // parse the query vars in the page URL
           var queryParams = ioQuery.queryToObject( window.location.search.slice(1) );

           var config = {
               containerID: "gen-browser",
               include: [
                   '/static/jbrowse/jbrowse_conf.json',
                   '/static/jbrowse/jbrowse.conf'
               ],
               browserRoot: '/static/jbrowse',
               dataRoot: '/static/jbrowse/data', //queryParams.data,                // TODO: data source?
               queryParams: queryParams,                  // TODO: parameters?
               location: queryParams.loc,                 // TODO
               forceTracks: queryParams.tracks,
               initialHighlight: queryParams.highlight,
               show_nav: 1, //queryParams.nav,
               show_tracklist: 0, //queryParams.tracklist,
               show_overview: 1, //queryParams.overview,
               stores: {
                    url: {
                        type: "JBrowse/Store/SeqFeature/FromConfig", features: []
                    }
               },
               makeFullViewURL: false,
               updateBrowserURL: true
           };

           //if there is ?addFeatures in the query params,
           //define a store for data from the URL
           if( queryParams.addFeatures ) {
               config.stores.url.features = JSON.parse( queryParams.addFeatures );
           }

           // if there is ?addTracks in the query params, add
           // those track configurations to our initial
           // configuration
           if( queryParams.addTracks ) {
               config.tracks = JSON.parse( queryParams.addTracks );
           }

           // if there is ?addStores in the query params, add
           // those store configurations to our initial
           // configuration
           if( queryParams.addStores ) {
               config.stores = JSON.parse( queryParams.addStores );
           }

           // create a JBrowse global variable holding the JBrowse instance
           JBrowse = new Browser( config );
        });
    }])
    .controller('DataPickerToggleCtl', ['$scope', function($scope) {
        $scope.isCollapsed = true;
    }])
;