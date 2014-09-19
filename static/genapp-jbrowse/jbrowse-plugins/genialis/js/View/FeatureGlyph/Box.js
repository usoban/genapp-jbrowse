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
    renderBox: function( context, viewInfo, feature, top, overallHeight, parentFeature, style, queryLocations, subjectLocations, annotationLocations ) {
        var left  = viewInfo.block.bpToX( feature.get('start') );
        var width = viewInfo.block.bpToX( feature.get('end') ) - left;
        var endPosTxt;

        style = style || lang.hitch( this, 'getStyle' );

        var height = this._getFeatureHeight( viewInfo, feature );

        if( ! height )
            return;

        if ('label' in viewInfo) {
            top += viewInfo.label.h;
        }

        if (typeof 'queryLocations' !== 'undefined' && queryLocations !== null) {
            top += queryLocations.h;
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

        // render locations on query sequence
        if (typeof queryLocations !== 'undefined' && queryLocations !== null) {
            context.font = queryLocations.font;
            context.fillStyle = queryLocations.fill;
            context.textBaseline = queryLocations.baseline;

            // start
            context.fillText (
                parseInt(feature.get('start')) > 0 ? feature.get('start') : 1,
                left,
                top
            );

            // end
            endPosTxt = new String(feature.get('end'));
            context.fillText(
                endPosTxt,
                left + width - endPosTxt.length * queryLocations.tw,
                top
            );
        }

        if (typeof subjectLocations !== 'undefined' && subjectLocations !== null) {
            var matchLocs,
                matchStart,
                matchEnd;

            context.font = subjectLocations.font;
            context.fillStyle = subjectLocations.fill;
            context.textBaseline = subjectLocations.baseline;

            // start
            matchLocs = feature.get('matchlocs').split(' ');
            matchStart = parseInt(matchLocs[0]);
            matchEnd = parseInt(matchLocs[1]);
            context.fillText(
                matchStart,
                left,
                top + height + subjectLocations.h
            );
            // end
            context.fillText(
                matchEnd,
                left + width - new String(matchEnd).length * subjectLocations.tw,
                top + height + subjectLocations.h
            );
        }

        var annotations = feature.get('annotations');
        if (typeof annotations !== 'undefined') {
            annotations = JSON.parse(annotations);
            for (var i = 0; i < annotations.length; i++) {
                var l = viewInfo.block.bpToX(annotations[i]['from']),
                    r = viewInfo.block.bpToX(annotations[i]['to']),
                    w = r - l + 1;

                context.fillStyle = annotationLocations.markerFill;
                context.fillRect(
                    l,
                    top + height + subjectLocations.h + annotationLocations.h,
                    w,
                    annotationLocations.markerThickness
                );

                context.font = annotationLocations.font;
                context.fillStyle = annotationLocations.textFill;
                context.textBaseline = annotationLocations.baseline;
                context.fillText(
                    annotations[i]['value'],
                    l + (w - annotations[i]['value'].length * annotationLocations.tw)/2,
                    top + height + subjectLocations.h + annotationLocations.h - annotationLocations.markerThickness
                );
            }
        }
    },

    // Render label above feature
    renderLabel: function( context, fRect ) {
        if( fRect.label ) {
            context.font = 'bold ' + fRect.label.font;
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
//            context.moveTo(0, fRect.t + fRect.label.yOffset + fRect.queryLocations.h);
//            context.lineTo(200, fRect.t + fRect.label.yOffset + fRect.queryLocations.h);
//            context.stroke();
        }
    },

    mouseoverFeature: function( context, fRect ) {
        var top = fRect.t;

        this.renderFeature( context, fRect );

        if ('label' in fRect) {
            top += fRect.label.h;
        }
        if ('queryLocations' in fRect) {
            top += fRect.queryLocations.h;
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

    makeFeatureAnnotations: function(feature, fRect) {
        var font = this.getStyle(feature, 'textFont'),
            dims = this.measureFont(font),
            textFill = this.getStyle(feature, 'textColor'),
            markerFill = this.getStyle(feature, 'markerColor'),
            markerThickness = this.getStyle( fRect.f, 'connectorThickness' );
        return {
            font: font,
            baseline: 'bottom',
            h: dims.h + markerThickness,
            tw: dims.w,
            textFill: textFill,
            markerFill: markerFill,
            markerThickness: 5
        };
    },

    // given an under-construction feature layout rectangle, expand it
    // to accomodate a label and/or a description
    _expandRectangleWithLabels: function( viewArgs, feature, fRect ) {
        var label,
            queryLocations,
            subjectLocations,
            annotations;

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

        queryLocations = this.makeFeatureDetails(feature, fRect);
        if (queryLocations) {
            fRect.queryLocations = queryLocations;
            fRect.h += queryLocations.h;
            queryLocations.yOffset = label.h; //fRect.rect.h + label.h;
        }

        subjectLocations = this.makeFeatureDetails(feature, fRect);
        if (subjectLocations) {
            fRect.subjectLocations = subjectLocations;
            fRect.h += subjectLocations.h;
            queryLocations.yOffset = label.h;
        }

        // if any subfeature is annotated
        annotations = this.makeFeatureAnnotations(feature, fRect);
        if (annotations) {
            fRect.annotations = annotations;
            fRect.h += annotations.h;
        }
    }
});
});
