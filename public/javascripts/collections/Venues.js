/**
 * Created by dgraves on 3/26/15.
 */
define(["backbone", "Config", "Utils", "models/Venue"], function(Backbone, Config, Utils, VenueModel) {

    var VenuesCollection = Backbone.Collection.extend({
        model: VenueModel,

        initialize: function(models, options) {
            options || (options = {});
            Config.DEBUG_MODE && console.log("VenuesCollection.initialize(): ", arguments);
            this._address = options.address || Config.DEFAULT_ADDRESS;
            this._searchParams = {
                section: options.section || Config.DEFAULT_SECTION,
                forceRefresh: (typeof options.forceRefresh === "boolean" ? options.forceRefresh : false)
            }
        },

        url: function() {
            return Config.routes.exploreVenuesNearAddress(this._address, this._searchParams);
        },

        parse: function(response, options) {
            Config.DEBUG_MODE && console.log("VenuesCollection.parse(): ", arguments);
            return Utils.parseFetchResponse(response);
        },

        getAddress: function() {
            return this._address;
        },

        setAddress: function(address) {
            this._address = address;
        }
    });

    return VenuesCollection;
});
