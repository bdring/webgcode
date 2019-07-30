"use strict";
define(['Ember', 'cnc/ui/threeDView',  'cnc/cam/cam'], function (Ember, threeD, cam) {
    var GraphicView = Ember.ContainerView.extend({
        classNames: ['viewContainer'],
        init: function () {
            this._super();
            this.pushObject(EmberThreeDView.create());
        }
    });

    var EmberThreeDView = Ember.View.extend({
        classNames: ['ThreeDView'],
        didInsertElement: function () {
            var _this = this;
            var threeDView = new threeD.ThreeDView(this.$());
            this.set('nativeComponent', threeDView);
            this.set('highlightDisplay', threeDView.createOverlayNode(threeDView.highlightMaterial));
            this.highlightChanged();
            var simulatedPath = this.get('controller.simulatedPath');
            this.addFragments(simulatedPath, 0, simulatedPath.length);
            simulatedPath.addArrayObserver({
                arrayWillChange: function (observedObj, start, removeCount, addCount) {
                    if (removeCount == observedObj.length)
                        threeDView.clearView();
                },
                arrayDidChange: function (observedObj, start, removeCount, addCount) {
                    _this.addFragments(observedObj, start, addCount);
                }
            });
        },
        addFragments: function (source, start, addCount) {
            for (var i = 0; i < addCount; i++) {
                var fragment = source[start + i];
                this.get('nativeComponent')[fragment.speedTag == 'rapid' ? 'rapidToolpathNode' : 'normalToolpathNode']
                    .addCollated(fragment.vertices);
            }
            if (addCount)
                this.get('nativeComponent').reRender();
        },
        simulatedPathChanged: function () {
            if (!this.get('controller.computing'))
                this.get('nativeComponent').zoomExtent();
        }.observes('controller.computing'),
        highlightChanged: function () {
            var highlightDisplay = this.get('highlightDisplay');
            var highlight = this.get('controller.currentHighLight');
            highlightDisplay.clear();
            if (highlight)
                highlightDisplay.addPolyLines([highlight]);
            this.get('nativeComponent').reRender();
        }.observes('controller.currentHighLight'),
        toolMoved: function () {
            var position = this.get('controller.toolPosition');
            this.get('nativeComponent').setToolVisibility(true);
            this.get('nativeComponent').setToolPosition(position.x, position.y, position.z);

        }.observes('controller.toolPosition')
    });
    
    return GraphicView;
});