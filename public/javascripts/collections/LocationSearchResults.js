/**
 * Created by dgraves on 3/16/15.
 */
define(["backbone", "config", "Utils"], function(Backbone, Config, Utils) {

    var LocationSearchResultModel = Backbone.Model.extend({
        defaults: {
        },

        parse: function(response, options) {
            //Config.DEBUG_MODE && console.log("LocationSearchResultModel.parse(): ", arguments);

            if (typeof response === "string") {
                var address = response.split(","),
                    address_str = address.length <= 2 ? address.join(", ") : (address[0] + ", " + address[1]);

                return {
                    address: address_str
                };
            }

            return Utils.parseFetchResponse(response);
        }
    });

    var LocationSearchResults = Backbone.Collection.extend({
        model: LocationSearchResultModel,

        initialize: function(models, options) {
            Config.DEBUG_MODE && console.log("LocationSearchResults.initialize(): ", arguments);
            options || (options = {});
            this._address = options.address || Config.DEFAULT_ADDRESS;
        },

        url: function() {
            Config.DEBUG_MODE && console.log("LocationSearchResults.url() triggered!");
            return Config.routes.getSuggestedAddress(this._address);
        },

        parse: function(response, options) {
            Config.DEBUG_MODE && console.log("LocationSearchResults.parse(): ", arguments);
            return Utils.parseFetchResponse(response);
        },

        setAddress: function(address) {
            this._address = Utils.normalizeQueryParam(address);
        }
    });

    return LocationSearchResults;
});
