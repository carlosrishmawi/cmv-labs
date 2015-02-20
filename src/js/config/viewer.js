define([
    'dojo/_base/lang',

    'esri/config',
    'esri/InfoTemplate',
    'esri/layers/ImageParameters',
    'esri/tasks/GeometryService',
    'esri/units'
], function (
    lang,

    esriConfig,
    InfoTemplate,
    ImageParameters,
    GeometryService,
    units
) {

    //esri config
    esriConfig.defaults.io.proxyUrl = 'proxy/proxy.ashx';
    esriConfig.defaults.io.alwaysUseProxy = false;
    esriConfig.defaults.geometryService = new GeometryService('http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer');

    var imageParams = lang.mixin(new ImageParameters(), {
        format: 'png32'
    });

    return {
        debug: true,
        layout: {
            type: 'core/layout/PaneLayout',
            options: {
                // panes
                // left, right, top and bottom panes (bc regions) with map center
                // pane ids like cmvLeftPane, cmvBottomPane, etc
                panes: ['left'],
                collapsable: ['left'],
                splitters: [],
                header: true
            }
        },
        //mapNodeId: 'mapDiv', // optional node to create map. defaults to 'cmvMap'
        map: {
            basemap: 'streets',
            center: [-98.579404, 39.828127],
            zoom: 5,
            sliderStyle: 'small'
        },
        layerInfos: [{
            type: 'esri/layers/FeatureLayer',
            url: 'http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/SanFrancisco/311Incidents/FeatureServer/0',
            options: {
                id: 'sf311Incidents',
                opacity: 1.0,
                visible: true,
                outFields: ['*'],
                mode: 0,
                infoTemplate: new InfoTemplate()
            }
        }, {
            type: 'esri/layers/ArcGISDynamicMapServiceLayer',
            url: 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/DamageAssessment/MapServer',
            options: {
                id: 'DamageAssessment',
                opacity: 1.0,
                visible: true,
                imageParameters: imageParams
            } //,
            //preLoad: function (layer) {
            //    //called after layer init but before added to map
            //    console.log(layer);
            //},
            //onLoad: function (r) {
            //    //native esri layer on load callback
            //    var layer = r.layer;
            //    console.log(layer);
            //},
            //foo: 'bar' //any custom props obj fnc etc to be mixed into layer model
        }],
        widgetInfos: [{
            type: 'esri/dijit/Directions', // widget class
            options: { // widget constructor options
                map: true,
                id: 'directionsWidget', // id is optional but recommended
                routeTaskUrl: 'http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Network/USA/NAServer/Route',
                routeParams: {
                    directionsLanguage: 'en-US',
                    directionsLengthUnits: units.MILES
                },
                showClearButton: true,
                active: false //for 3.12, starts active by default
            },
            placeAt: 'titlePane', // place at
            className: 'directions-widget', // class to add to widget, required for placeAt 'map', otherwise optional
            placeParentAt: 'cmvLeftPane', // required for placeAt 'titlePane'
            parentOptions: { // options for parent e.g. titlePane
                icon: 'fa-car',
                title: 'Directions',
                open: true,
                canFloat: false
            }
        }, {
            type: 'widgets/Measurement',
            options: {
                map: true,
                mapClickMode: true,
                defaultAreaUnit: units.SQUARE_MILES,
                defaultLengthUnit: units.MILES
            },
            placeAt: 'titlePane',
            placeParentAt: 'cmvLeftPane',
            parentOptions: {
                icon: 'fa-info-circle',
                title: 'Measurement',
                open: false,
                canFloat: true
            }
        }, {
            type: 'widgets/MapInfo',
            options: {
                map: true,
                mode: 'dms',
                firstCoord: 'y',
                unitScale: 3,
                showScale: true,
                xLabel: '',
                yLabel: '',
                minWidth: 286
            },
            placeAt: 'map',
            className: 'mapInfoWidget'
        }]
    };
});