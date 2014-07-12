define([
   'dojo/_base/declare',
   'JBrowse/Plugin'
],
function(
   declare,
   JBrowsePlugin
) {
    return declare( JBrowsePlugin, {
        constructor: function() { /* dummy */ console.log('genialis plugin!'); }
    });
});