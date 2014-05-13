'use strict';

angular.module('jbrowse.controllers', [])
    .controller('JBrowseCtl', ['_project', '$scope', '$route', function (_project, $scope, $route) {
        $route.current.params.caseId = '53725825fad58d4de892c2a7'; // TODO: hack.
        var type = 'all'; // TODO
        var data_type = ('data:' + type).toLowerCase();
        var preFilter = function(obj) {
            var objtype = obj.type;
            return (objtype.indexOf(data_type) === 0) ? true : false
        };

        $scope.project = _project;
        $scope.genOptions = {
            itemsByPage: 15,
            project: $scope.project,
            enableRowSelection: false
        };
        console.log($scope.genOptions);

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

//        var JBrowse;
//        require(['JBrowse/Browser', 'dojo/io-query', 'dojo/json' ], function (Browser,ioQuery,JSON) {
//           // the initial configuration of this JBrowse
//           // instance
//
//           // NOTE: this initial config is the same as any
//           // other JBrowse config in any other file.  this
//           // one just sets defaults from URL query params.
//           // If you are embedding JBrowse in some other app,
//           // you might as well just set this initial config
//           // to something like { include: '../my/dynamic/conf.json' },
//           // or you could put the entire
//           // dynamically-generated JBrowse config here.
//
//           // parse the query vars in the page URL
//           var queryParams = ioQuery.queryToObject( window.location.search.slice(1) );
//
//           var config = {
//               containerID: "gen-browser",
//               dataRoot: queryParams.data,                // TODO: data source?
//               queryParams: queryParams,                  // TODO: parameters?
//               location: queryParams.loc,                 // TODO
//               forceTracks: queryParams.tracks,
//               initialHighlight: queryParams.highlight,
//               show_nav: queryParams.nav,
//               show_tracklist: queryParams.tracklist,
//               show_overview: queryParams.overview,
//               stores: { url: { type: "JBrowse/Store/SeqFeature/FromConfig", features: [] } },
//               makeFullViewURL: function( browser ) {
//                   // the URL for the 'Full view' link
//                   // in embedded mode should be the current
//                   // view URL, except with 'nav', 'tracklist',
//                   // and 'overview' parameters forced to 1.
//                   return browser.makeCurrentViewURL({ nav: 1, tracklist: 1, overview: 1 });
//               },
//               updateBrowserURL: true
//           };
//
//           //if there is ?addFeatures in the query params,
//           //define a store for data from the URL
//           if( queryParams.addFeatures ) {
//               config.stores.url.features = JSON.parse( queryParams.addFeatures );
//           }
//
//           // if there is ?addTracks in the query params, add
//           // those track configurations to our initial
//           // configuration
//           if( queryParams.addTracks ) {
//               config.tracks = JSON.parse( queryParams.addTracks );
//           }
//
//           // if there is ?addStores in the query params, add
//           // those store configurations to our initial
//           // configuration
//           if( queryParams.addStores ) {
//               config.stores = JSON.parse( queryParams.addStores );
//           }
//
//           // create a JBrowse global variable holding the JBrowse instance
//           JBrowse = new Browser( config );
//        });
    }])
;