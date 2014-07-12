define( "Genialis/View/Track/Wiggle/XYPlot", [
            'dojo/_base/declare',
            'JBrowse/View/Track/Wiggle/XYPlot',
            'JBrowse/Util'
        ],
        function( declare, WiggleXYPlotBase, Util) {

var XYPlot = declare( [WiggleXYPlotBase],

/**
 * Wiggle track that shows data with an X-Y plot along the reference.
 *
 * @lends JBrowse.View.Track.Wiggle.XYPlot
 * @extends JBrowse.View.Track.WiggleBase
 */
{

    /**
     * Draw a set of features on the canvas.
     * @private
     */
    _drawFeatures: function( scale, leftBase, rightBase, block, canvas, pixels, dataScale ) {
        var thisB=this;
        var context = canvas.getContext('2d');
        var canvasHeight = canvas.height;

        var ratio = Util.getResolution( context, this.browser.config.highResolutionMode );
        var toY = dojo.hitch( this, function( val ) {
           return canvasHeight * ( 1-dataScale.normalize(val) ) / ratio;
        });
        var originY = toY( dataScale.origin );

        var disableClipMarkers = this.config.disable_clip_markers;

        dojo.forEach( pixels, function(p,i) {
            if (!p)
                return;
            var score = toY(p['score']);
            var f = p['feat'];

            // draw the background color if we are configured to do so
            if( score >= 0 ) {
                var bgColor = this.getConfForFeature('style.bg_color', f );
                if( bgColor ) {
                    context.fillStyle = bgColor;
                    thisB._fillRectMod( context, i, 0, 1, canvasHeight );
                }
            }


            if( score <= canvasHeight || score > originY) { // if the rectangle is visible at all
                if( score <= originY ) {
                    // bar goes upward
                    context.fillStyle = this.getConfForFeature('style.pos_color',f);
                    thisB._fillRectMod( context, i, score, 1, score-dataScale.min+1);
                    if( !disableClipMarkers && score < 0 ) { // draw clip marker if necessary
                        context.fillStyle = this.getConfForFeature('style.clip_marker_color',f) || this.getConfForFeature('style.neg_color',f);
                        thisB._fillRectMod( context, i, 0, 1, 3 );

                    }
                }
                else {
                    // bar goes downward
                    context.fillStyle = this.getConfForFeature('style.neg_color',f);
                    thisB._fillRectMod( context, i, score, 1, score-dataScale.min+1 );
                    if( !disableClipMarkers && score >= canvasHeight ) { // draw clip marker if necessary
                        context.fillStyle = this.getConfForFeature('style.clip_marker_color',f) || this.getConfForFeature('style.pos_color',f);
                        thisB._fillRectMod( context, i, canvasHeight-3, 1, 3 );

                    }
                }
            }
        }, this );
    }
});

return XYPlot;
});
