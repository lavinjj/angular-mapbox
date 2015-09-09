(function() {
  'use strict';

  angular.module('angular-mapbox').service('mapboxService', mapboxService);

  function mapboxService() {
    var _mapInstances = [],
        _markers = [],
        _mapOptions = [],
        _drawingFeatureGroup,
        _drawControl;

    var fitMapToMarkers = debounce(function() {
      // TODO: refactor
      var map = _mapInstances[0];
      var group = new L.featureGroup(getMarkers());
      map.fitBounds(group.getBounds());
    }, 0);

    var service = {
      init: init,
      getMapInstances: getMapInstances,
      addMapInstance: addMapInstance,
      getMarkers: getMarkers,
      addMarker: addMarker,
      removeMarker: removeMarker,
      fitMapToMarkers: fitMapToMarkers,
      getOptionsForMap: getOptionsForMap,
      addDrawingLayer: addDrawingLayer,
      getPolyArea: getPolyArea
    };
    return service;

    function init(opts) {
      opts = opts || {};
      L.mapbox.accessToken = opts.accessToken;
    }

    function addMapInstance(map, mapOptions) {
      mapOptions = mapOptions || {};

      _mapInstances.push(map);
      _mapOptions.push(mapOptions);
      _markers.push([]);
    }

    function getMapInstances() {
      return _mapInstances;
    }

    function addMarker(marker) {
      // TODO: tie markers to specific map instance
      var map = getMapInstances()[0];
      _markers[0].push(marker);

      var opts = getOptionsForMap(map);
      if(opts.scaleToFit) {
        fitMapToMarkers(map);
      }
    }

    function removeMarker(map, marker) {
      map.removeLayer(marker);

      var markerIndexToRemove;
      for(var i = 0, markers = getMarkers(); markers[i]; i++) {
        if(markers[i]._leaflet_id === marker._leaflet_id) {
          markerIndexToRemove = i;
        }
      }
      markers.splice(markerIndexToRemove, 1);

      var opts = getOptionsForMap(map);
      if(opts.scaleToFit && opts.scaleToFitAll) {
        fitMapToMarkers(map);
      }
    }

    // TODO: move to utils
    function debounce(func, wait, immediate) {
      var timeout;

      return function() {
        var context = this,
            args = arguments;

        var later = function() {
          timeout = null;
          if (!immediate) {
            func.apply(context, args);
          }
        };

        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
          func.apply(context, args);
        }
      };
    }

    function getMarkers() {
      return _markers[0];
    }

    function getOptionsForMap(map) { // jshint ignore:line
      // TODO: get options for specific map instance
      return _mapOptions[0];
    }

    function addDrawingLayer(map, drawOptions){
      _drawingFeatureGroup = L.featureGroup().addTo(map);

      _drawControl = new L.Control.Draw({
        edit: {
          featureGroup: _drawingFeatureGroup
        },
        draw: drawOptions
      }).addTo(map);

      map.on('draw:created', showPolygonArea);
      map.on('draw:edited', showPolygonAreaEdited);
    }

    function showPolygonAreaEdited(e) {
      e.layers.eachLayer(function(layer) {
        showPolygonArea({ layer: layer });
      });
    }

    function showPolygonArea(e) {
      _drawingFeatureGroup.clearLayers();
      _drawingFeatureGroup.addLayer(e.layer);
    }

    function getPolyArea()
    {
      var ptArray = [];

      _drawingFeatureGroup.eachLayer(function (layer) {
        ptArray = layer._latlngs;
      });

      var polyData = '';
      for (var n=0 ; n < ptArray.length ; n++ ) {
        var lat = ptArray[n].lat;
        var lng = ptArray[n].lng;
        polyData += lat + "," + lng + ";";
      }

      return polyData;
    }

  }
})();
