/**
 * Created by dgraves on 2/27/15.
 */
define(["backbone", "config", "Utils"], function(Backbone, Config, Utils) {
    var TRENDING_CATEGORY = "trending";

    var VenueSearchRequest = Backbone.Model.extend({
        defaults: {
            "address": Config.DEFAULT_ADDRESS,
            "section": Config.DEFAULT_SECTION,
            "forceRefresh": "false"
        },

        initialize: function(attrs, options) {
            Config.DEBUG_MODE && console.log("VenuesCollection: SearchRequest.initialize(): ", arguments);

            // If category attribute provided, apply this value to "section", which is real category
            if (_.isObject(attrs) && attrs.category) {
                this.setCategory(attrs.category);
            }
        },

        setCategory: function(category) {
            category || (category = Config.DEFAULT_SECTION);
            this.set("section", category);
        },

        setAddress: function(address) {
            address || (address = Config.DEFAULT_ADDRESS);
            this.set("address", address);
        },

        isTrendingRequest: function() {
            return this.getCategory() === TRENDING_CATEGORY;
        },

        getAddress: function() {
            var address = this.get("address") || Config.DEFAULT_ADDRESS;
            return Utils.normalizeQueryParam(address);
        },

        getCategory: function() {
            var category = this.get("section") || Config.DEFAULT_SECTION;
            return Utils.normalizeQueryParam(category);
        },

        getUrl: function() {
            var address = this.getAddress(),
                options = _.omit(this.toJSON(), "address");

            if (this.isTrendingRequest()) {
                return Config.routes.getTrendingVenuesNearAddress(address, _.omit(options, "section"))
            } else {
                return Config.routes.exploreVenuesNearAddress(address, options)
            }
        },

        getWebUrl: function() {
            var address = this.getAddress(),
                section = this.getCategory(),
                url = Utils.formatUrl("explore/" + address + "/" + section);

            return url;
        }
    },{
        // *******************************************************
        // CLASS METHODS
        // *******************************************************

        pickAttrs: function(o) {
            if (!_.isObject(o)) return {};

            // Don't modify original object
            var attrs = $.extend(true, {}, o);
            return _.pick(attrs, "address", "category", "section");
        }
    });

    return VenueSearchRequest;
});

/**
 Example Collection Using VenueSearchRequest

    var VenuesCollection = Backbone.Collection.extend({
        model: VenueModel,

        initialize: function(models, options) {
            Config.DEBUG_MODE && console.log("VenuesCollection.initialize(): ", arguments);
            options || (options = {});
            var searchRequestAttrs = VenueSearchRequest.pickAttrs(options);
            this.searchRequest = new VenueSearchRequest(searchRequestAttrs);
            this.searchRequest.on("change", this.onSearchRequestChanged, this);
            this.once("destroy", this.removeEventBindings, this);
            this._fetchOnChange = options.hasOwnProperty("fetchOnChange") ? options.fetchOnChange : true;
        },

        url: function() {
            Config.DEBUG_MODE && console.log("VenuesCollection.url() triggered!");
            return this.searchRequest.getUrl();
        },

        parse: function(response, options) {
            Config.DEBUG_MODE && console.log("VenuesCollection.js: parse(): ", arguments);
            return Utils.parseFetchResponse(response);
        },

        onSearchRequestChanged: function() {
            Config.DEBUG_MODE && console.log("VenuesCollection.onSearchRequestChanged() Triggered! arguments = ", arguments, "\n\t_fetchOnChange = ", this._fetchOnChange);

            if (this._fetchOnChange) {
                this.reset();
                this.trigger("fetch:start");
                this.fetch({
                    cache: true,
                    success: function (collection, resp, options) {
                        collection.trigger("fetch:complete fetch:success");
                    },
                    error: function (collection, resp, options) {
                        collection.trigger("fetch:complete fetch:error");
                    }
                });
            }
        },

        removeEventBindings: function() {
            Config.DEBUG_MODE && console.log("VenuesCollection.removeEventBindings()");
            this.off("destroy", this.removeEventBindings, this);
            this.searchRequest.off("change", this.onSearchRequestChanged, this);
        },

        updateSearchRequest: function(attrs) {
            _.isObject(attrs) && this.searchRequest.set(attrs);
        },

        getSearchRequestModel: function() {
            return this.searchRequest;
        }
    });
*/
