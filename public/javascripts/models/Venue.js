/**
 * Created by dgraves on 12/19/14.
 */
define(["backbone", "config", "Utils"], function(Backbone, Config, Utils) {

    var VenueModel = Backbone.Model.extend({
        urlRoot: Config.BASE_URL + "/foursquare/venues",

        defaults: {
        },

        /*
         initialize: function(attrs, options) {
         console.log("VenueModel.initialize(): ", arguments);
         },
         */

        parse: function (response, options) {
            //Config.DEBUG_MODE && console.log("VenueModel.parse(): ", arguments);
            return Utils.parseFetchResponse(response);
        }
    });

    return VenueModel;
});
