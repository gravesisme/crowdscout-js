/**
 * Created by dgraves on 3/11/15.
 */
define(["backbone", "config", "Utils", "collections/RecentMedia"], function(Backbone, Config, Utils, RecentMediaCollection) {

    var NearbyMediaCollection = RecentMediaCollection.extend({
        initialize: function(models, options) {
            Config.DEBUG_MODE && console.log("NearbyMediaCollection.initialize(): ", arguments);
            options || (options = {});
            this._coords = options.coords || {
                lat: options.lat,
                lng: options.lng
            };
        },

        url: function() {
            Config.DEBUG_MODE && console.log("NearbyMediaCollection.url() triggered!");
            return Config.routes.getMediaNearLocation(this._coords.lat, this._coords.lng);
        },

        setCoords: function(lat, lng) {
            this._coords = {
                lat: lat,
                lng: lng
            };
        }
    });

    return NearbyMediaCollection;
});
