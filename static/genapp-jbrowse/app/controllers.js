'use strict';
var G;

angular.module('jbrowse.controllers', [])
    .controller('JBrowseCtl', ['_project', '$scope', '$route', 'notify', function (_project, $scope, $route, notify) {
        var browserConnector,
            selectTrack,
            isArray;

        // Track selection handler
        selectTrack = function (items) {
            var addTrack, genTypeHandlers, reloadRefSeqs;

            // reloads reference sequences
            reloadRefSeqs = function(newRefseqsUrl) {
                var deferredRefSeqs,
                    deferredSetup,
                    setupFn;

                delete $scope.browser._deferred['reloadRefSeq'];
                deferredSetup = $scope.browser._getDeferred('reloadRefSeqs');
                setupFn = function() {
                    if (!('allRefs' in $scope.browser) || _.keys($scope.browser.allRefs).length == 0) {
                        return;
                    }
                    _.each($scope.browser.allRefs, function(r){
                        $scope.browser.refSeqSelectBox.addOption({
                            label: r.name,
                            value: r.name
                        });
                    });
                    
                    deferredSetup.resolve(true);
                };

                $scope.browser.allRefs = {};
                $scope.browser.refSeq = null;
                $scope.browser.refSeqOrder = [];
                $scope.browser.refSeqSelectBox.removeOption($scope.browser.refSeqSelectBox.getOptions());
                $scope.browser.refSeqSelectBox.set('value', '');

                $scope.browser.config['refSeqs'] = {
                    url: newRefseqsUrl
                };

                delete $scope.browser._deferred['loadRefSeqs'];

                deferredRefSeqs = $scope.browser.loadRefSeqs();
                deferredRefSeqs.then(setupFn);

                return deferredSetup;
            };

            // adds track to the JBrowse
            addTrack = function(trackCfg) {
                var isSequenceTrack = trackCfg.type == 'JBrowse/View/Track/Sequence',
                    alreadyExists = _.find($scope.browser.config.tracks || [], function(v) {
                        return v.label == trackCfg.label;
                    }) !== undefined;

                if (alreadyExists) {
//                    notify.error('Track is already present in the viewport.');
                    console.log('Track is already present in the viewport.');
                    return;
                }

                // prepare for config loading.
                $scope.browser.config.include = [];
                if ($scope.browser.reachedMilestone('loadConfig')) {
                    delete $scope.browser._deferred['loadConfig'];
                }

                $scope.browser.config.include.push({
                    format: 'JB_json',
                    version: 1,
                    data: {
                        sourceUrl: trackCfg.baseUrl || '#',
                        tracks: [trackCfg]
                    }
                });
                $scope.browser.loadConfig().then(function() {
                    // NOTE: must be in this order, since navigateToLocation will set reference sequence name,
                    // which will be used for loading sequence chunks.
                    if (isSequenceTrack) {
                        $scope.browser.navigateToLocation({ref: _.values($scope.browser.allRefs)[0].name});
                    }
                    $scope.browser.showTracks([trackCfg.label]);
                });
            };

            // handlers for each data object type
            genTypeHandlers = {
                'data:genome:fasta:': function(item){
                    var baseUrl = '/api/data/' + item.id + '/download/seq',
                        lbl = item.static.name,
                        dontLoad = false;

                    if ($scope.browser.config.stores/* && 'refseqs' in $scope.browser.config.stores*/) {
                         $scope.browser.getStore('refseqs', function(store){
                            var seqTrackName;
                            if (!store) return;
                            seqTrackName = store.config.label;
                            if (lbl == seqTrackName) {
                                dontLoad = true;
                                return;
                            }
                            $scope.browser.publish('/jbrowse/v1/v/tracks/delete', [{label: seqTrackName}]);
                            delete $scope.browser.config.stores['refseqs'];
                        });
                    }

                    if (dontLoad) return;

                    reloadRefSeqs(baseUrl + '/refSeqs.json').then(function(){
                        addTrack({
                            type:        'JBrowse/View/Track/Sequence',
                            storeClass:  'JBrowse/Store/Sequence/StaticChunked',
                            urlTemplate: 'seq/{refseq_dirpath}/{refseq}-',
                            baseUrl:     baseUrl,
                            category:    'Reference sequence',
                            label:       lbl,
                            chunkSize:   20000
                        });
                    });
                },
                'data:alignment:bam:': function(item) {
                    var url = '/api/data/' + item.id + '/download/';
                    addTrack({
                        type: 'JBrowse/View/Track/Alignments2',
                        storeClass: 'JBrowse/Store/SeqFeature/BAM',
                        category: 'NGS',
                        urlTemplate: url + item.output.bam.file,
                        baiUrlTemplate: url + item.output.bai.file,
                        key: 'BAM alignment',
                        label: item.static.name,
                        chunkSize: 20000
                    });
                }
            };

            if (isArray(items) && items.length > 0) {
                if (items[0].type in genTypeHandlers) {
                    genTypeHandlers[items[0].type](items[0]);
                }
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
                dojo.destroy(browser.menuBar);
            });

            // watch for table selection
            $scope.$watch('selection', selectTrack, true);

            // make sure tracks detached from the view ('hidden') actually are deleted.
            $scope.browser.subscribe('/jbrowse/v1/c/tracks/hide', function(trackCfgs) {
                $scope.browser._deleteTrackConfigs(trackCfgs);
            });
        };

        // =====================================
        //      JBrowse initialization
        // =====================================
        require(['JBrowse/Browser', 'dojo/io-query', 'dojo/json' ], function (Browser,ioQuery,JSON) {
            var config;

            // monkey-patch
            Browser.prototype._configDefaults = function() {
                return {
                    tracks: [],
                    containerID: 'GenomeBrowser',
                    dataRoot: 'data',
                    show_tracklist: true,
                    show_nav: true,
                    show_overview: true,
                    refSeqs: [],
                    include: [],
                    datasets: {
                        _DEFAULT_EXAMPLES: false
                    },
                    highlightSearchedRegions: false,
                    highResolutionMode: 'disabled'
                };
            };

            config = {
               containerID: "gen-browser",
               browserRoot: '/static/jbrowse',
               baseUrl: '/api/data',
               dataRoot: '/api/data',
               refSeqs: '/static/genapp-jbrowse/refSeqs.json', // dummy refSeqs.json file
               show_nav: true,
               show_tracklist: false,
               show_overview: true,
               makeFullViewURL: false,
               updateBrowserURL: false,
               suppressUsageStatistics: true,
               include: []
           };

           // create a JBrowse global variable holding the JBrowse instance
           $scope.browser = new Browser(config);
//           G = $scope.browser;
           browserConnector();
        });
    }])
    .controller('DataPickerToggleCtl', ['$scope', function($scope) {
        $scope.isCollapsed = true;
    }])
;