/**
 * Created by dgraves on 4/8/15.
 */
define(["marionette", "Config", "Utils", "text!partials/empty_view.html"], function(Marionette, Config, Utils, template) {
    "use strict";

    var EmptyView = Backbone.Marionette.ItemView.extend({
        className: "emptyView",
        template: _.template(template)
    });

    return EmptyView;
});
