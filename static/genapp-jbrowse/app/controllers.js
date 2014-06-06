'use strict';
var G;

angular.module('jbrowse.controllers', [])
    .controller('JBrowseCtl', ['_project', '$scope', '$route', function (_project, $scope, $route) {
        var browserConnector,
            selectTrack,
            isArray;

        selectTrack = function (items) {
            var item, track, url;

            if (isArray(items) && items.length > 0) {
                item = items[0];

                if (item.type == "data:genome:fasta:") {
                    // was pre-formatted with JBrowse's tool, so it has config
                    track = '/api/data/' + item.id + '/download/trackList.json';
                    $scope.browser.config.include.push(track);

                    if ($scope.browser.reachedMilestone('loadConfig')) {
                        delete $scope.browser._deferred['loadConfig'];
                    }
                    console.log();


                    $scope.browser.loadConfig().then(function(){
                       $scope.browser.showTracks(['DNA']);
                    });
                    // TODO: remove other DNA tracks.

                    track = {
                        type:        'SequenceTrack',
                        storeClass:  'JBrowse/Store/Sequence/StaticChunked',
                        urlTemplate: 'seq/{refseq_dirpath}/{refseq}-',
                        baseUrl:     '/api/data/' + item.id + '/download',
                        category:    'Reference sequence',
                        store:       'refseqs',
                        key:         'Genesis test sequence',
                        label:       'gen-dna',
                        chunkSize:   20000
                    };

//                    console.log(track);
//                    $scope.browser.addStoreConfig.call($scope.browser, 'refseqs', track);
//                    $scope.browser.publish('/jbrowse/v1/c/tracks/new', [track]);
//                    $scope.browser.trackConfigsByName.gen_seq = track;
//                    $scope.browser.addTracks([track]);
//                    $scope.browser.showTracks(['gen-dna']);
//                     $scope.browser.replaceTracks([track]);
                } else if (item.type == "data:alignment:bam:") {
                    console.log(item);

//                    $scope.browser.addStore()

                    url = '/api/data/' + item.id + '/download/';
                    track = {
                        type: 'JBrowse/View/Track/Alignments2',
                        storeClass: 'JBrowse/Store/SeqFeature/BAM',
                        category: 'NGS',
                        // baseUrl: 'http://gendev.lan:10180/static/jbrowse/data/', // required ?
                        urlTemplate: url + item.output.bam,
                        baiUrlTemplate: url + item.output.bai,
                        // store: 'store1223678765', // required ?
                        key: 'BAM alignment',
                        label: 'bam-track',
                        chunkSize: 20000
                    };

                    $scope.browser.publish('/jbrowse/v1/c/tracks/new', [track]);
                }

//                bamTrack.urlTemplate = '/api/data/' + items[0].id + '/download/' + items[0].output.bam.file;
//                bamTrack.baiUrlTemplate = '/api/data/' + items[0].id + '/download/' + items[0].output.bai.file;
            }
        };

        // utility.
        isArray = function (value) {
            return Object.prototype.toString.call(value) === '[object Array]';
        };

        // =====================================
        //      URL settings handlers
        //======================================
//        function handleSettingsChange() {
//            $scope.$watch();
//        }

        // =====================================
        //      data table helper functions
        // =====================================
        var preFilter = '';
        $scope.selection = [];
        $scope.project = _project;
        $scope.genOptions = {
            itemsByPage: 15,
            project: $scope.project,
            enableRowSelection: false
        };
        $scope.tableOptions = {
            itemsByPage: 15,
            project: _project,
            genId: 'datalist-all',
            filter: preFilter,
            multiSelect: false,
            showExport: true,
            showImport: true,
            selectedItems: $scope.selection
        };

        // =====================================
        //      JBrowse plugin connector
        // =====================================
        browserConnector = function () {
            var browser = $scope.browser;

            // remove global menu bar
            browser.afterMilestone('initView', function() {
//                dojo.destroy(browser.menuBar);
            });

            // watch for table selection
            $scope.$watch('selection', selectTrack, true);
        };

        // =====================================
        //      JBrowse initialization
        // =====================================
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

//            console.log(Browser.prototype._configDefaults)

            // monkey-patch on fly.
            Browser.prototype._configDefaults = function() {
                return {
                    tracks: [],
                    containerID: 'GenomeBrowser',
                    dataRoot: 'data',
                    show_tracklist: true,
                    show_nav: true,
                    show_overview: true,
                    refSeqs: "{dataRoot}/seq/refSeqs.json",
                    include: [],
//                    nameUrl: "{dataRoot}/names/root.json",

                    datasets: {
//                        _DEFAULT_EXAMPLES: true,
//                        volvox:    { url: '?data=sample_data/json/volvox',    name: 'Volvox Example'    },
//                        modencode: { url: '?data=sample_data/json/modencode', name: 'MODEncode Example' },
//                        yeast:     { url: '?data=sample_data/json/yeast',     name: 'Yeast Example'     }
                    },
                    highlightSearchedRegions: false,
                    highResolutionMode: 'disabled'
                };
            };

           var queryParams = ioQuery.queryToObject( window.location.search.slice(1) );
           console.log(queryParams);//TODO: remove
           var config = {
               containerID: "gen-browser",
               include: [
//                   '/static/jbrowse/jbrowse_conf.json',
//                   '/static/jbrowse/jbrowse.conf'
//                   '/api/data/537a0286fad58d7bd5ab97ce/download/trackList.json'
               ],
               browserRoot: '/static/jbrowse',
               baseUrl: '/api/data',
               dataRoot: '/api/data/537a0286fad58d7bd5ab97ce/download', //queryParams.data,                // TODO: data source?
               queryParams: queryParams,                  // TODO: parameters?
               location: queryParams.loc,                 // TODO
               forceTracks: queryParams.tracks,
               initialHighlight: queryParams.highlight,
               show_nav: 1, //queryParams.nav,
               show_tracklist: 1, //queryParams.tracklist,
               show_overview: 1, //queryParams.overview,
               stores: {
                    url: {
                        type: "JBrowse/Store/SeqFeature/FromConfig", features: []
                    }
               },
               makeFullViewURL: false,
               updateBrowserURL: false,
               suppressUsageStatistics: true
           };

           //if there is ?addFeatures in the query params,
           //define a store for data from the URL
           if(queryParams.addFeatures) {
               config.stores.url.features = JSON.parse( queryParams.addFeatures );
           }

           // if there is ?addTracks in the query params, add
           // those track configurations to our initial
           // configuration
           if(queryParams.addTracks) {
               config.tracks = JSON.parse(queryParams.addTracks);
           }

           // if there is ?addStores in the query params, add
           // those store configurations to our initial
           // configuration
           if(queryParams.addStores) {
               config.stores = JSON.parse(queryParams.addStores);
           }

           // create a JBrowse global variable holding the JBrowse instance
           $scope.browser = new Browser(config);
           G = $scope.browser;
           browserConnector();
        });
    }])
    .controller('DataPickerToggleCtl', ['$scope', function($scope) {
        $scope.isCollapsed = true;
    }])
;