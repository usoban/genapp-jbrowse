'use strict';
/**
 * ===========
 * Controllers
 * ===========
 */

// CONSTANTS
var API_DATA_URL = '/api/v1/data/';

// CONTROLLERS
angular.module('jbrowse.controllers', ['genjs.services'])

    /**
     * .. js:function:: JBrowseController(Project, _project, $scope, $route)
     *
     *      **URL**: ``/``
     *
     *      :param Project: :class:`Case <server.models.Case>` resource
     *      :param _project: a deferred promise resolved before initialization for the initial case
     *      :param $scope: Angular's scope service
     *      :param $route: Angular's route service
     *
     *     Controlls JBrowse genome browser.
     */
    .controller('JBrowseController', ['Project', '_project', '$scope', '$route', 'notify', function (Project, _project, $scope, $route, notify) {
        var browserConnector,
            selectTrack,
            isArray,
            filters;

        Project.get({}, function (data) {
            $scope.projectsData = data;
        });

        // project onclick handler
        $scope.selectProject = function(caseId) {
            var project = _.find($scope.projectsData.objects || [], function(p) {
                if (p.id == caseId) return true;
                return false;
            });

            if (typeof project !== 'undefined') {
                $route.current.params.caseId = project.id;
                $scope.project = project;
                $scope.tableOptions.project = project;
            }
        };

        // Track selection handler
        selectTrack = function (items) {
            var addTrack,
                genTypeHandlers,
                filterHandlers,
                reloadRefSeqs;

            // reloads reference sequences
            reloadRefSeqs = function(newRefseqsUrl) {
                var deferredRefSeqs,
                    deferredSetup,
                    setupFn;

                delete $scope.browser._deferred['reloadRefSeqs'];
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
                    alreadyExists = _.findWhere($scope.browser.config.tracks || [], {label: trackCfg.label}) !== undefined;

                if (alreadyExists) {
                    notify({message: "Track " + trackCfg.label + " is already present in the viewport.", type: "danger"});
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
                    var baseUrl = API_DATA_URL + item.id + '/download/seq',
                        lbl = item.static.name,
                        dontLoad = false;

                    if ($scope.browser.config.stores) {
                         $scope.browser.getStore('refseqs', function(store){
                            var seqTrackName;
                            if (!store) return;
                            seqTrackName = store.config.label;
                            if (lbl == seqTrackName) {
                                dontLoad = true;
                                return;
                            }
                            // remove all tracks if we're changing sequence.
                            $scope.browser.publish('/jbrowse/v1/v/tracks/delete', $scope.browser.config.tracks);
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
                    var url = API_DATA_URL + item.id + '/download/';
                    addTrack({
                        type: 'JBrowse/View/Track/Alignments2',
                        storeClass: 'JBrowse/Store/SeqFeature/BAM',
                        category: 'NGS',
                        urlTemplate: url + item.output.bam.file,
                        baiUrlTemplate: url + item.output.bai.file,
                        label: item.static.name,
                        chunkSize: 20000
                    });
                }
            };
            // filter actions to take in the data selector gui when some data type selected.
            filterHandlers = {
                'data:genome:fasta:': function() {
                    $scope.selectionModel.restrictedMode = false;
                    $scope.selectionModel.type = 'Other';
                }
            };

            if (isArray(items) && items.length > 0) {
                if (items[0].type in genTypeHandlers) {
                    genTypeHandlers[items[0].type](items[0]);
                } else {
                    console.log('No handler for type ' + items[0].type);
                }

                if (items[0].type in filterHandlers) {
                    filterHandlers[items[0].type]();
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

        // Data table - intialized with the first case available
        // (the case is resolved by router before the controller is ran)
        filters = {
            'Sequence': function(obj) {
                var showTypes = {"data:genome:fasta:": true};
                return obj.type in showTypes;
            },
            'Other': function(obj){
                var showTypes = {"data:alignment:bam:": true};
                return obj.type in showTypes;
            }
        };

        $scope.selection = [];
        $scope.project = _project;
        $scope.tableOptions = {
            itemsByPage: 15,
            project: $scope.project,
            genId: 'datalist-all',
            multiSelect: false,
            showExport: true,
            showImport: true,
            selectedItems: $scope.selection,
            filter: filters['Sequence']
        };

        // Data table pre-filters
        $scope.selectionModel = {
            type: 'Sequence',
            restrictedMode: true
        };
        $scope.$watch('selectionModel.type', function(selectionType) {
            if (selectionType in filters) {
                $scope.tableOptions.filter = filters[selectionType];
            }
        });

        // JBrowse connector callback.
        browserConnector = function () {

            // remove global menu bar
           $scope.browser.afterMilestone('initView', function() {
                dojo.destroy($scope.browser.menuBar);
            });

            // watch for table selection
            $scope.$watch('selection', selectTrack, true);

            // make sure tracks detached from the view ('hidden') actually are deleted in the browser instance
            $scope.browser.subscribe('/jbrowse/v1/c/tracks/hide', function(trackCfgs) {
                $scope.browser.publish('/jbrowse/v1/v/tracks/delete', trackCfgs);
            });
        };

        // JBrowse initialization, using dojo loader.
        require(['JBrowse/Browser', 'dojo/io-query', 'dojo/json' ], function (Browser,ioQuery,JSON) {
            var config;

            // monkey-patch. We need to remove default includes, since off-the-shelf version of JBrowse
            // forces loading of jbrowse.conf even if we pass empty array as includes.
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

            // actual JBrowse configuration.
            // Loads dummy refseqs in the start, as JBrowse requires them. Appropriate refseqs are
            // loaded when selecting a genome sequence track.
            config = {
               containerID: "gen-browser",
               browserRoot: '/static/jbrowse',
               baseUrl: API_DATA_URL,
               dataRoot: API_DATA_URL,
               refSeqs: '/static/genapp-jbrowse/refSeqs.json', // dummy refSeqs.json file
               show_nav: true,
               show_tracklist: false,
               show_overview: true,
               makeFullViewURL: false,
               updateBrowserURL: false,
               suppressUsageStatistics: true,
               include: [],
               highResolutionMode: 'enabled'
           };

           $scope.browser = new Browser(config);
           browserConnector();
        });
    }])

    /**
     * .. js:function:: DataPickerToggleCtl($scope)
     *
     *      :param $scope: Angular's scope service
     *
     *     Controlls toggling of data selector.
     */
    .controller('DataPickerToggleCtl', ['$scope', function($scope) {
        $scope.isCollapsed = true;
    }])
;