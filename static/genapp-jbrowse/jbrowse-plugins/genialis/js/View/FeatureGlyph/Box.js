define('Genialis/View/FeatureGlyph/Box', [
           'dojo/_base/declare',
           'dojo/_base/array',
           'dojo/_base/lang',
           'JBrowse/View/FeatureGlyph/Box'
       ],
       function(
           declare,
           array,
           lang,
           FeatureGlyphBox
       ) {

return declare([ FeatureGlyphBox ], {

    // Rendering the box beneath label
    renderBox: function( context, viewInfo, feature, top, overallHeight, parentFeature, style, details ) {
        var left  = viewInfo.block.bpToX( feature.get('start') );
        var width = viewInfo.block.bpToX( feature.get('end') ) - left;

        style = style || lang.hitch( this, 'getStyle' );

        var height = this._getFeatureHeight( viewInfo, feature );

        if( ! height )
            return;


        if ('label' in viewInfo) {
            top += viewInfo.label.h;
        }

        if( height != overallHeight )
            top += Math.round( (overallHeight - height)/2 );

        // background
        var bgcolor = style( feature, 'color' );
        if( bgcolor ) {
            context.fillStyle = bgcolor;
            context.fillRect( left, top, Math.max(1,width), height );
        }
        else {
            context.clearRect( left, top, Math.max(1,width), height );
        }

        // foreground border
        var borderColor, lineWidth;
        if( (borderColor = style( feature, 'borderColor' )) && ( lineWidth = style( feature, 'borderWidth')) ) {
            if( width > 3 ) {
                context.lineWidth = lineWidth;
                context.strokeStyle = borderColor;

                // need to stroke a smaller rectangle to remain within
                // the bounds of the feature's overall height and
                // width, because of the way stroking is done in
                // canvas.  thus the +0.5 and -1 business.
                context.strokeRect( left+lineWidth/2, top+lineWidth/2, width-lineWidth, height-lineWidth );
            }
            else {
                context.globalAlpha = lineWidth*2/width;
                context.fillStyle = borderColor;
                context.fillRect( left, top, Math.max(1,width), height );
                context.globalAlpha = 1;
            }
        }

        if (typeof details !== 'undefined' && details !== null) {
            var endPosTxt;
            context.font = details.font;
            context.fillStyle = details.fill;
            context.textBaseline = details.baseline;

            // start
            context.fillText (
                feature.get('start'),
                left,
                top + height + details.h
            );

            // end
            endPosTxt = new String(feature.get('end'));
            context.fillText(
                endPosTxt,
                left + width - endPosTxt.length * details.tw,
                top + height + details.h
            );
        }
    },

    // Render label above feature
    renderLabel: function( context, fRect ) {
        if( fRect.label ) {
            context.font = fRect.label.font;
            context.fillStyle = fRect.label.fill;
            context.textBaseline = fRect.label.baseline;
            context.fillText( fRect.label.text,
                              fRect.l+(fRect.label.xOffset||0),
                              fRect.t + fRect.label.h
                            );

//            var tmp = context.stokeStyle;
//            context.strokeStyle = 'blue';
//            context.lineWidth = 2;
//            context.beginPath();
//            context.moveTo(0, fRect.t);
//            context.lineTo(200, fRect.t);
//            context.stroke();
//
//            context.lineWidth = 2;
//            context.beginPath();
//            context.moveTo(0, fRect.t + fRect.label.yOffset + fRect.details.h);
//            context.lineTo(200, fRect.t + fRect.label.yOffset + fRect.details.h);
//            context.stroke();
        }
    },

    mouseoverFeature: function( context, fRect ) {
        var top = fRect.t;

        this.renderFeature( context, fRect );

        if ('label' in fRect) {
            top += fRect.label.h;
        }

        // highlight the feature rectangle if we're moused over
        context.fillStyle = this.getStyle( fRect.f, 'mouseovercolor' );
        context.fillRect( fRect.rect.l, top, fRect.rect.w, fRect.rect.h );
    },

    makeFeatureDetails: function(feature, fRect) {
        var font = this.getStyle( feature, 'textFont' ),
            dims = this.measureFont(font),
            fill = this.getStyle(feature, 'textColor');

        return {
            font: font,
            baseline: 'bottom',
            h: dims.h,
            tw: dims.w,
            fill: fill
        };
    },

    // given an under-construction feature layout rectangle, expand it
    // to accomodate a label and/or a description
    _expandRectangleWithLabels: function( viewArgs, feature, fRect ) {
        var label,
            details;

        // maybe get the feature's name, and update the layout box
        // accordingly
        if( viewArgs.showLabels ) {
            label = this.makeFeatureLabel( feature, fRect );
            if( label ) {
                fRect.h += label.h;
                fRect.w = Math.max( label.w, fRect.w );
                fRect.label = label;
                label.yOffset = fRect.rect.h + label.h;
            }
        }

        details = this.makeFeatureDetails(feature, fRect);
        if (details) {
//            console.log('got labels for ' + details.labels.length + ' subfeatures.');
            fRect.details = details;
            fRect.h += details.h;
            details.yOffset = fRect.rect.h + label.h;
        }

//        // maybe get the feature's description if available, and
//        // update the layout box accordingly
//        if( viewArgs.showDescriptions ) {
//            var description = this.makeFeatureDescriptionLabel( feature, fRect );
//            if( description ) {
//                fRect.description = description;
//                fRect.h += description.h;
//                fRect.w = Math.max( description.w, fRect.w );
//                description.yOffset = fRect.h-(this.getStyle( feature, 'marginBottom' ) || 0);
//            }
//        }
    }
});
});
