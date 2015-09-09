(function() {
    'use strict';

    var angularMapboxExample = angular.module('angular-mapbox-drawing-example', ['angular-mapbox']);

    angularMapboxExample.controller('demoController', function($scope, $timeout, mapboxService) {
        $scope.polyData = [];

        $scope.drawingOptions = {
            polygon: true,
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false
        };

        mapboxService.init({ accessToken: 'pk.eyJ1IjoibGljeWV1cyIsImEiOiJuZ1gtOWtjIn0.qaaGvywaJ_kCmwmlTSNyVw' });
        $timeout(function() {
            var map = mapboxService.getMapInstances()[0];
            mapboxService.addDrawingLayer(map, $scope.drawingOptions);
        }, 100);

        $scope.mapMovedCallback = function(bounds) {
            console.log('You repositioned the map to:');
            console.log(bounds);
        };

        $scope.mapZoomedCallback = function(bounds) {
            console.log('You zoomed the map to:');
            console.log(bounds.getCenter().toString());
        };

        $scope.onUpdatePolyData = function(){
            $scope.polyData = mapboxService.getPolyArea();
        }
    });

})();
