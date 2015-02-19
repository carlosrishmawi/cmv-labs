define([
    'core/models/appModel',
    'core/models/layerModel',
    'core/models/widgetModel',

    'put-selector/put',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/on',

    'esri/map',

    'core/layout/FloatingTitlePane',
    'core/layout/FloatingWidgetDialog'
], function (
    appModel, LayerModel, WidgetModel,

    put, array, declare, lang, on,

    Map,

    FloatingTitlePane,
    FloatingWidgetDialog
) {
    return declare(null, {
        _layers: [], //temp array for layer loading
        constructor: function (config) {
            config = config || {};
            //enable debugging
            if (config.debug === true) {
                window.app = this;
                appModel.set('debug', true);
                this.model = appModel;
            }
            //start w/ a layout
            this.initLayout(config);
        },

        // require and create layout
        initLayout: function (config) {
            // default layout if not provided
            if (!config.layout) {
                config.layout = {
                    type: 'core/layout/CMVLayout',
                    options: {
                        panes: ['left'],
                        collapsable: ['left'],
                        header: true
                    }
                };
            }
            //require layout class and set appModel.layout
            require([config.layout.type], lang.hitch(this, function (Layout) {
                var layout = new Layout(config.layout.options);
                //set model's 'layout' property
                appModel.set('layout', layout);
                //init the map
                this.initMap(config);
            }));
        },

        // create the map
        initMap: function (config) {
            //clone map config
            appModel.set('mapConfig', lang.clone(config.map));
            //create map using 'cmvMap'
            var map = new Map('cmvMap', config.map);
            //sets model's `map` property
            appModel.set('map', map);
            //appModel map on load wires up model map events
            map.on('load', lang.hitch(appModel, 'mapLoad'));
            //wait until the map is loaded before continuing to init app
            map.on('load', lang.hitch(this, 'initLayers', config, map));
        },

        // require layer classes and init each layer
        initLayers: function (config, map) {
            if (config.layerInfos && config.layerInfos.length > 0) {
                //build array of layer types, require them, create layers and add to map
                var modules = [];
                array.forEach(config.layerInfos, function (layer) {
                    modules.push(layer.type);
                });
                require(modules, lang.hitch(this, function () {
                    array.forEach(config.layerInfos, function (layerInfo) {
                        require([layerInfo.type], lang.hitch(this, 'initLayer', layerInfo));
                    }, this);
                    on.once(map, 'layers-add-result', lang.hitch(this, 'initWidgets', config));
                    map.addLayers(this._layers);
                }));
            } else {
                this.initWidgets(config);
            }
        },

        // create layerInfo and layer
        initLayer: function (layerInfo, Layer) {
            //create layer Model
            layerInfo = new LayerModel(layerInfo);
            //create layer
            var layer = new Layer(layerInfo.url, layerInfo.options);
            //pre and on load methods
            if (layerInfo.preLoad) {
                layerInfo.preLoad(layer);
            }
            if (layerInfo.onLoad) {
                layer.on('load', lang.hitch(layer, layerInfo.onLoad));
            }
            //set as `layer` property
            layerInfo.set('layer', layer);
            //set layer info `id` property same as layer id
            layerInfo.set('id', layer.id);
            //layerInfo to model
            appModel.layerInfos.unshift(layerInfo);
            //unshift instead of push to keep layer ordering on map intact
            this._layers.unshift(layer);
        },

        // require widget classes and init each widget
        initWidgets: function (config) {
            if (config.widgetInfos && config.widgetInfos.length > 0) {
                //build array of widget types, require them, create widgets and add to map
                var modules = [];
                array.forEach(config.widgetInfos, function (widgetInfo) {
                    modules.push(widgetInfo.type);
                });
                require(modules, lang.hitch(this, function () {
                    array.forEach(config.widgetInfos, function (widgetInfo) {
                        require([widgetInfo.type], lang.hitch(this, 'initWidget', widgetInfo));
                    }, this);
                    // check for and call layout.endLoading()
                    if (typeof appModel.layout.endLoading === 'function') {
                        appModel.layout.endLoading();
                    }
                }));
            } else {
                // check for and call layout.endLoading()
                if (typeof appModel.layout.endLoading === 'function') {
                    appModel.layout.endLoading();
                }
            }
        },

        // create widgetInfo and widget
        initWidget: function (widgetInfo, Widget) {
            //replace model properties in config if true
            if (widgetInfo.options.model === true) { //better to require 'core/models/appModel'
                widgetInfo.options.model = appModel;
            }
            if (widgetInfo.options.map === true) {
                widgetInfo.options.map = appModel.map;
            }
            if (widgetInfo.options.layerInfos === true) {
                widgetInfo.options.layerInfos = appModel.layerInfos;
            } else if (widgetInfo.options.layerInfos && widgetInfo.options.layerInfos.length) {
                //replace layer ids with layers if custom layerInfos
                array.forEach(widgetInfo.options.layerInfos, function (info) {
                    var layer = appModel.map.getLayer(info.layer);
                    if (info.layer && layer) {
                        info.layer = layer;
                    }
                }, this);
            }
            if (widgetInfo.options.widgetInfos === true) {
                widgetInfo.options.widgetInfos = appModel.widgetInfos;
            }
            //create widget model
            widgetInfo = new WidgetModel(widgetInfo);
            //create widget and place appropriately
            //var widget = new Widget(widget.options); //this doesn't work with some esri widgets like Legend which require srcNodeRef when constructing :/
            var widget, parentWidget,
                srcNodeRef = (widgetInfo.className) ? 'div.' + widgetInfo.className : 'div';
            switch (widgetInfo.get('placeAt')) {
            case 'map':
                widget = new Widget(widgetInfo.options, put(appModel.map.root, srcNodeRef + ' div'));
                break;
            case 'titlePane':
                if (!widgetInfo.get('placeParentAt')) {
                    appModel.handleError({
                        source: 'Controller',
                        method: 'initWidget',
                        error: 'placing ' + widgetInfo.type + ' in a titlePane requires "placeParentAt" property'
                    });
                    return;
                }
                parentWidget = this.createTitlePaneWidget(widgetInfo);
                widgetInfo.set('parentWidget', parentWidget);
                widget = new Widget(widgetInfo.options, put(srcNodeRef)).placeAt(parentWidget.containerNode);
                break;
            default:
                break;
            }
            // start the widget
            this.startupWidget(widgetInfo, widget);
        },

        // create and return a title pane widget
        createTitlePaneWidget: function (widgetInfo) {
            var options = lang.mixin({
                title: 'Widget',
                open: false,
                canFloat: false
            }, widgetInfo.get('parentOptions'));
            var tp = new FloatingTitlePane(options, put('div')).placeAt(widgetInfo.get('placeParentAt'), 'last');
            tp.startup();
            return tp;
        },

        // start the widget
        startupWidget: function (widgetInfo, widget) {
            //start it
            if (typeof widget.startup === 'function') {
                widget.startup();
            }
            //set as `widget` property
            widgetInfo.set('widget', widget);
            //set widget info `id` property same as widget id
            widgetInfo.set('id', widget.id);
            //widgetInfo to model
            appModel.widgetInfos.unshift(widget);
        }
    });
});