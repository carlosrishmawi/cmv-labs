define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/fx',
    'dojo/dom-construct',

    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane',

    'put-selector/put',

    'xstyle/css!./CMVLayout/CMVLayout.css'
], function (
    declare,
    lang,
    array,
    baseFx,
    domConst,

    BorderContainer,
    ContentPane,

    put
) {
    return declare(null, {
        container: null,
        panes: {},
        title: 'Configurable Map Viewer',
        subtitle: 'make it your own',
        logoProps: {
            src: 'js/core/layout/CMVLayout/rocket-logo.png',
            height: 54,
            alt: 'logo'
        },
        constructor: function (options) {
            options = options || {};

            // put loading
            this.loading = put(document.body, 'div.cmv-loading');
            this.loading.innerHTML = '<div class="cmv-loading-content"><i class="fa fa-circle-o-notch fa-spin"></div>';

            var containerClass;
            if (options.header === true) {
                // header options
                this.title = options.title || this.title;
                this.subtitle = options.subtitle || this.subtitle;
                this.logoProps = options.logoProps || this.logoProps;
                // put header
                var header = put(document.body, 'div.cmv-header');
                // put logo
                if (options.logo !== false) {
                    put(header, 'img.cmv-header-logo', this.logoProps);
                }
                // the titles
                var titleWrapper = put(header, 'div.cmv-header-title-wrapper');
                put(titleWrapper, 'span.cmv-header-title', this.title);
                put(titleWrapper, 'div.cmv-header-subtitle', this.subtitle);
                containerClass = 'cmv-pane-container-header';
            } else {
                containerClass = 'cmv-pane-container-full';
            }

            // border container for panes
            this.container = new BorderContainer({
                liveSplitters: false,
                gutters: false,
                design: 'sidebar'
            }, put(document.body, 'div.' + containerClass));
            this.container.startup();

            // map is the center pane
            this.panes.center = new ContentPane({
                region: 'center',
                id: 'cmvMap',
                className: 'cmv-map-pane'
            });
            this.container.addChild(this.panes.center);

            // add panes
            array.forEach(options.panes, function (pane) {
                this.panes[pane] = new ContentPane({
                    region: pane,
                    id: 'cmv' + pane.charAt(0).toUpperCase() + pane.substring(1) + 'Pane',
                    className: 'cmv-' + pane + '-pane'
                });
                this.container.addChild(this.panes[pane]);
            }, this);

            // add collapse controls
            // TODO
        },

        endLoading: function () {
            var node = this.loading;
            baseFx.fadeOut({
                node: node,
                duration: 1200,
                onEnd: function () {
                    domConst.destroy(node);
                }
            }).play();
        }
    });
});