/**
 * Created by dgraves on 4/2/15.
 */
define(["marionette", "Config", "PubSub"], function(Marionette, Config, PubSub) {
    // Flag used to determine if logging should be enabled for this class
    var DEBUG_MODE = false || Config.DEBUG_MODE;

    var SearchButtonView = Backbone.Marionette.ItemView.extend({
        id: "nav-search-btn",

        tagName: "button",

        className: "btn btn-default navbar-btn pull-right glyphicon glyphicon-search",

        attributes: {
            "type": "button"
        },

        template: false,

        events: {
            "click": function(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                //this.commands.execute("show_search_page");
                PubSub.trigger("navigate", "/search", true);
            }
        },

        initialize: function (options) {
            options || (options = {});

            DEBUG_MODE && console.log("SearchButtonView.initialize(): arguments = ", arguments);

            this.commands = options.commands;
            this.reqres = options.reqres;
        }
    });

    return SearchButtonView;
});
