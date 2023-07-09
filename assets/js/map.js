let osm = new ol.layer.Tile({
    title: 'OpenStreetMap',
    type: 'base',
    visible: true,
    source: new ol.source.OSM()
});
console.log(4)
var LandslideSusceptibilityMap_reclass = new ol.layer.Image({
    title: 'LandslideSusceptibilityMap_reclass',
    source: new ol.source.ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/gisgeoserver_03/wms',
        params: { 'LAYERS': 'gisgeoserver_03:LandslideSusceptibilityMap_reclass' }
    }),
});

var Susceptibility_Map_map = new ol.layer.Image({
    title: 'Susceptibility_Map_map',
    source: new ol.source.ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/gisgeoserver_03/wms',
        params: { 'LAYERS': 'gisgeoserver_03:Susceptibility_Map_map' }
    }),
    visible: false
});
var population = new ol.layer.Image({
    title: 'population',
    source: new ol.source.ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/gisgeoserver_03/wms',
        params: { 'LAYERS': 'gisgeoserver_03:population' }
    }),
    visible: false
    
});


//Add the layers to layer groups
let basemapLayers = new ol.layer.Group({
    title: "Base Maps",
    layers: [osm]
});
let overlayLayers = new ol.layer.Group({
    title: "Overlay Layers",
    layers: [LandslideSusceptibilityMap_reclass, Susceptibility_Map_map, population]
})

let map = new ol.Map({
    target: document.getElementById('map'),
    layers: [basemapLayers, overlayLayers],
    view: new ol.View({
        center: ol.proj.fromLonLat([10.370688, 46.468425]),
        zoom: 11
    }),
});





// Add the map controls:
map.addControl(new ol.control.ScaleLine()); //Controls can be added using the addControl() map function
map.addControl(new ol.control.FullScreen());
map.addControl(new ol.control.OverviewMap());
map.addControl(
    new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),
        projection: 'EPSG:32632',
        className: 'custom-control',
        undefinedHTML: '0.0000, 0.0000'
    })
);


//Add the layer switcher control
var layerSwitcher = new ol.control.LayerSwitcher({});
map.addControl(layerSwitcher);





//Add the Stamen base layers
var stamenWatercolor = new ol.layer.Tile({
    title: 'Stamen Watercolor',
    type: 'base',
    visible: false,
    source: new ol.source.Stamen({
        layer: 'watercolor'
    })
});
var stamenToner = new ol.layer.Tile({
    title: 'Stamen Toner',
    type: 'base',
    visible: false,
    source: new ol.source.Stamen({
        layer: 'toner'
    })
});

// Add the Stamen base layers
var stamenWatercolor = new ol.layer.Tile({
    title: 'Stamen Watercolor',
    type: 'base',
    visible: false,
    source: new ol.source.Stamen({
        layer: 'watercolor'
    })
});
var stamenToner = new ol.layer.Tile({
    title: 'Stamen Toner',
    type: 'base',
    visible: false,
    source: new ol.source.Stamen({
        layer: 'toner'
    })
});

// Add the Esri Basemaps
var esriSatellite = new ol.layer.Tile({
    title: 'Esri Satellite',
    type: 'base',
    visible: false,
    source: new ol.source.XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributions: '© <a href="https://www.esri.com">Esri</a>'
    })
});

var esriStreet = new ol.layer.Tile({
    title: 'Esri Street',
    type: 'base',
    visible: false,
    source: new ol.source.XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        attributions: '© <a href="https://www.esri.com">Esri</a>'
    })
});

var esriTopo = new ol.layer.Tile({
    title: 'Esri Topographic',
    type: 'base',
    visible: false,
    source: new ol.source.XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attributions: '© <a href="https://www.esri.com">Esri</a>'
    })
});



// Extend the list using the .extend() function adding the new layers
basemapLayers.getLayers().extend([stamenWatercolor, stamenToner, esriSatellite, esriStreet, esriTopo]);

// Add the code for the Pop-up
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var popup = new ol.Overlay({
  element: container
});
map.addOverlay(popup);

// This is the event listener for the map. It fires when a single click is made on the map.
map.on('singleclick', async function (event) {
  content.innerHTML = '<h5>Data:</h5>'; // Resets the popup content
  let visibleLayers = getVisibleLayers(map); // Find the visible layers with a function

  // For each visible layer, retrieve the URL for the request and make the AJAX request
  for (const visibleLayer of visibleLayers) {
    if (typeof visibleLayer.getSource().getFeatureInfoUrl === 'function') {
      var viewResolution = map.getView().getResolution();
      var url = visibleLayer.getSource().getFeatureInfoUrl(
        event.coordinate,
        viewResolution,
        map.getView().getProjection(),
        { 'INFO_FORMAT': 'application/json' }
      );

      if (url) {
        var pixel = event.pixel;
        var coord = map.getCoordinateFromPixel(pixel);
        // We do an AJAX request to get the data from the GetFeatureInfo request
        try {
          const response = await fetch(url);
          const data = await response.json();
          console.log(data);

          // Iterate over the features (in our case, there's only 1 feature per layer)
          var features = data.features;
          if (features.length > 0) {
            for (var i = 0; i < features.length; i++) {
              var feature = features[i];
              var value = feature.properties.GRAY_INDEX; // All layers have the significant data on GRAY_INDEX

              // Append to the popup
              content.innerHTML += '<b>' + (visibleLayer.get('title')) + '</b><br>';
              if (value != undefined) // For geometries (no gray index), only append the name
                content.innerHTML += '   ' + value + '<br>';
            }
            popup.setPosition(coord);
          }
        } catch (error) {
          console.log(error);
          content.innerHTML += '<b>' + (visibleLayer.get('title')) + '</b><br> Error retrieving layer information<br>';
        }
      }
    }
  }
});

// This closes the pop-up when the X button is clicked
closer.onclick = function () {
  popup.setPosition(undefined);
  closer.blur();
  return false;
};

// Adding map event for pointermove
map.on('pointermove', function (event) {
  var pixel = map.getEventPixel(event.originalEvent);
  var hit = map.hasFeatureAtPixel(pixel);
  map.getTarget().style.cursor = hit ? 'pointer' : '';
});

// Recursive function to get all visible layers
function getVisibleLayers(stuff) {
  let layers = stuff.getLayers().getArray();

  layers = layers.filter(layer => layer.getVisible());

  layers = layers.flatMap(layer => {
    if (layer instanceof ol.layer.Group) {
      return getVisibleLayers(layer);
    } else {
      return [layer];
    }
  });

  return layers;
}


  




