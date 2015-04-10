/**
 * Created by dgraves on 3/11/15.
 */
define(["backbone", "config", "Utils", "collections/RecentTweets"], function(Backbone, Config, Utils, RecentTweetsCollection) {

    var NearbyTweetsCollection = RecentTweetsCollection.extend({
        initialize: function(models, options) {
            Config.DEBUG_MODE && console.log("NearbyTweetsCollection.initialize(): ", arguments);
            options || (options = {});
            this._coords = options.coords || {
                lat: options.lat,
                lng: options.lng
            };
        },

        url: function() {
            Config.DEBUG_MODE && console.log("NearbyTweetsCollection.url() triggered!");
            return Config.routes.getTweetsNearLocation(this._coords.lat, this._coords.lng);
        },

        setCoords: function(lat, lng) {
            this._coords = {
                lat: lat,
                lng: lng
            };
        }
    });

    return NearbyTweetsCollection;
});
