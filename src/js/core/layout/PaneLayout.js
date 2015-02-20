define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/fx',
    'dojo/dom-construct',

    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane',

    'put-selector/put',

    'xstyle/css!./PaneLayout/css/PaneLayout.css'
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
            src: 'js/core/layout/PaneLayout/images/rocket-logo.png',
            height: 54,
            alt: 'logo'
        },
        constructor: function (options) {
            options = options || {};

            // put loading
            this.loading = put(document.body, 'div.cmvLoading');
            this.loading.innerHTML = '<div class="cmvLoadingContent"><i class="fa fa-circle-o-notch fa-spin"></div>';

            var containerClass;
            if (options.header === true) {
                // header options
                this.title = options.title || this.title;
                this.subtitle = options.subtitle || this.subtitle;
                this.logoProps = options.logoProps || this.logoProps;
                // put header
                var header = put(document.body, 'div.cmvHeader');
                // put logo
                if (options.logo !== false) {
                    put(header, 'img.cmvHeaderLogo', this.logoProps);
                }
                // the titles
                var titleWrapper = put(header, 'div.cmvHeaderTitleWrapper');
                put(titleWrapper, 'span.cmvHeaderTitle', this.title);
                put(titleWrapper, 'div.cmvHeaderSubtitle', this.subtitle);
                containerClass = 'cmvPaneContainerHeader';
            } else {
                containerClass = 'cmvPaneContainerNoHeader';
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
                className: 'map'
            });
            this.container.addChild(this.panes.center);

            // add panes
            array.forEach(options.panes, function (pane) {
                // id and class like cmvLeftPane, cmvRightPane, etc
                var paneIdClass = 'cmv' + pane.charAt(0).toUpperCase() + pane.substring(1) + 'Pane';
                this.panes[pane] = new ContentPane({
                    region: pane,
                    id: paneIdClass,
                    className: paneIdClass
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