/*
 * a full map layout without containers for widgets
*/
define([
    'dojo/_base/declare',
    'dojo/_base/fx',
    'dojo/dom-construct',
    'put-selector/put',
    'xstyle/css!./FullMapLayout/css/FullMapLayout.css'
], function (
    declare,
    baseFx,
    domConst,
    put
) {
    return declare(null, {
        constructor: function (options) {
            options = options || {};
            this.loading = put(document.body, 'div.cmvLoading');
            this.loading.innerHTML = '<div class="cmvLoadingContent"><i class="fa fa-circle-o-notch fa-spin"></div>';
            this.mapNode = put(document.body, 'div.map#cmvMap');
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