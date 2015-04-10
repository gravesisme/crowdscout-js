/**
 * Created by dgraves on 3/11/15.
 */
define(["backbone", "config", "Utils"], function(Backbone, Config, Utils) {

    var TweetModel = Backbone.Model.extend({
        defaults: {
        },

        /*
        initialize: function(attrs, options) {
            console.log("TweetModel.initialize(): ", arguments);
        },
        */

        parse: function(response, options) {
            //Config.DEBUG_MODE && console.log("TweetModel.parse(): ", arguments);
            return Utils.parseFetchResponse(response);
        }
    });

    return TweetModel;
});
