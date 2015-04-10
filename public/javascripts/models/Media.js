/**
 * Created by dgraves on 3/5/15.
 */
define(["backbone", "config", "Utils"], function(Backbone, Config, Utils) {

    var MediaModel = Backbone.Model.extend({
        urlRoot: Config.BASE_URL + "/instagram/media/",

        defaults: {
        },

        /*
        initialize: function(attrs, options) {
            console.log("MediaModel.initialize(): ", arguments);
        },
        */

        parse: function(response, options) {
            //Config.DEBUG_MODE && console.log("MediaModel.parse(): ", arguments);
            return Utils.parseFetchResponse(response);
        }
    });

    return MediaModel;
});
