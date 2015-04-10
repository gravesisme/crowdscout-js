/**
 * Created by dgraves on 3/11/15.
 */
define(["backbone", "config", "Utils", "models/Media"], function(Backbone, Config, Utils, MediaModel) {

    var RecentMediaCollection = Backbone.Collection.extend({
        model: MediaModel,

        initialize: function(models, options) {
            Config.DEBUG_MODE && console.log("RecentMediaCollection.initialize(): ", arguments);
            options || (options = {});
            this._venueId = options.venueId;
        },

        url: function() {
            Config.DEBUG_MODE && console.log("RecentMediaCollection.url() triggered!");
            return Config.routes.getRecentVenueMedia(this._venueId);
        },

        parse: function(response, options) {
            Config.DEBUG_MODE && console.log("RecentMediaCollection.parse(): ", arguments);
            return Utils.parseFetchResponse(response);
        },

        setVenueId: function(venueId) {
            this._venueId = venueId;
        }
    });

    return RecentMediaCollection;
});
