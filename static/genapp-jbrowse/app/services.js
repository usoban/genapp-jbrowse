'use strict';
/**
 * ========
 * Services
 * ========
 */

angular.module('jbrowse.services', ['ngResource', 'genjs.services'])
    .value('version', '0.1')

    /**
     * Resolves the first project.
     */
    .factory('resolveProject', ['$q', '$route', 'Project', function ($q, $route, Project, notify) {
        return function () {
            var deferred = $q.defer();
            Project.get({}, function (cases) {
                deferred.resolve(cases.objects[0] || {});
            }, function (reason) {
                var message = "An error occured, sorry";
                if (reason.status == 404)
                    message = "No project found.";
                else if (reason.status == 401)
                    message = "You do not have permission to view this case";
                notify({message: "An error occured, sorry", type: 'danger'});
                deferred.reject(message);
            });
            return deferred.promise;
        }
    }])

    /**
     * Generates JBrowse container IDs.
     */
    .factory('genBrowserId', function () {
        var browserCount = 0,
            genBrowserId = {};

        genBrowserId.generateId = function () {
            var genId = 'gen-browser' + '-' + browserCount;
            browserCount += 1;
            return genId;
        };

        return genBrowserId;
    })

    /**
     * Data types supported by Genesis JBrowse implementation.
     *
     *  - List represents conjunction
     *  - Dict represents disjunction
     *
     *  Examples:
     *
     *  Conjunction over multiple object fields:
     *      The following piece of code requires field output.bam.file to contain a file with .bam extension
     *      and output.bai.file to contain a file with .bai extension in order to declare given data item as supported.
     *
     *      'data:alignment:bam:': [
     *          {'output.bam.file': /.*\.bam$/},
     *          {'output.bai.file': /.*\.bai$/}
     *      ]
     *
     *  Conjunction over multiple values of a single field:
     *      Similarly, for the 'refs' fields (always a list, required by processor schema), we can require the field to
     *      contain two files (both must be present at the same time):
     *
     *      'data:variants:vcf:': {
     *          'output.vcf.refs': [/.*\.vcf\.bgz$/, /.*\.vcf\.bgz\.tbi$/]
     *      }
     *
     *  Disjunction over multiple fields:
     *      If we want to check whether at least one field suffices our condition, we can simply make a disjunction:

     *      'data:expression:polya:': {
     *          'output.rpkumpolya.refs': /.*\.bw/,
     *          'output.rpkmpolya.refs': /.*\.bw/,
     *          ............
     *      }
     *
     *  Combining:
     *      Lets combine disjunction and conjunction. We require at least one of rpkm* fields to contain
     *      both ".tab" file and ".bw" file.
     *
     *      'data:expression:polya:': {
     *          'output.rpkumpolya.refs': [/.*\.tab/, /.*\.bw/],
     *          'output.rpkmpolya.refs': [/.*\.tab/, /.*\.bw/],
     *          ............
     *      }
     */
    .factory('supportedTypes', function() {
        var propAccessor,
            commonPatterns,
            canShowPatterns,
            organization,
            api = {};

        // Organization of data selector tabs.
        organization = {
            'Sequence': {
                'data:genome:fasta:': true
            },
            'Other': {
                'data:alignment:bam:': true,
                'data:expression:polya:': true,
                'data:variants:vcf:': true,
                'data:annotation:gff3:': true
            }
        };

        commonPatterns = {
            bigWig: /.*\.bw/,
            exprBigWig: /.*\.tab\.bw$/,
            vcf: /.*\.vcf\.bgz$/,
            vcfIdx: /.*\.vcf\.bgz\.tbi$/
        };

        canShowPatterns = {
            'data:genome:fasta:': {
                'output.fasta.refs': [/seq/, /seq\/refSeqs\.json/]
            },
            'data:alignment:bam:': [
                {
                    'output.bam.file': /.*\.bam$/
                },
                {
                    'output.bai.file': /.*\.bai$/
                }
            ],
            'data:expression:polya:': {
                'output.rc.refs': commonPatterns['exprBigWig'],
                'output.rcpolya.refs': commonPatterns['exprBigWig'],
                'output.rpkm.refs': commonPatterns['exprBigWig'],
                'output.rpkmpolya.refs': commonPatterns['exprBigWig'],
                'output.rpkum.refs': commonPatterns['exprBigWig'],
                'output.rpkumpolya.refs': commonPatterns['exprBigWig']
            },
            'data:variants:vcf:': {
                'output.vcf.refs': [commonPatterns['vcf'], commonPatterns['vcfIdx']]
            },
            'data:annotation:gff3:': {
                'output.gff.refs': /tracks\/gff-track/
            }
        };

        // Utility function. Fetches deep object property by prop path (example prop path: output.fasta.file)
        propAccessor = function (item, propPath) {
            return _.reduce(propPath.split('.'), function (memo, k) {
                return memo[k];
            }, item);
        };

        // Tells whether given item can be shown in data selector (in given selection mode, e.g. 'Sequence' or 'Other')
        api.canShow = function(item, selectionMode) {
            var compute;

            compute = function (conditions, fieldName) {
                var entries;
                if (_.isRegExp(conditions)) {
                    entries = propAccessor(item, fieldName);
                    if (_.isArray(entries)) {
                        return _.some(entries, function (str) {
                            return conditions.test(str);
                        });
                    } else if (_.isString(entries)) {
                        return conditions.test(entries);
                    }
                } else if (_.isArray(conditions)) {
                    return _.every(conditions, function (arrItem) {
                        return compute(arrItem, fieldName);
                    });
                } else if (_.isObject(conditions)) {
                    return _.some(conditions, function (dictItem, dictKey) {
                        return compute(dictItem, dictKey);
                    });
                }
            };

            if (item.status !== 'done') return false;
            if (!(item.type in canShowPatterns)) return false;
            if (selectionMode && !(item.type in organization[selectionMode])) return false;

            return compute(canShowPatterns[item.type]);
        };

        api.find = function (item, propPath, pattern) {
            var entries = propAccessor(item, propPath);
            if (!_.isArray(entries)) entries = [entries];
            return _.find(entries, function (entry) {
                return pattern.test(entry);
            }) || false;
        };

        api.patterns = commonPatterns;

        return api;
    })
;
