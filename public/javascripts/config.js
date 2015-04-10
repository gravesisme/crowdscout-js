/**
 * Created by dgraves on 02/26/15.
 */
define(["_s", "Utils", "json!data/routes.json", "exports"], function(_s, Utils, routes, exports) {

    var ArrayProto = Array.prototype;

    var DEFAULT_CITIES = [
        "Boston, MA", "New York, NY", "Las Vegas, NV", "San Francisco, CA",
        "Miami Beach, FL", "Chicago, IL", "Los Angeles, CA",
        "Moscow", "Kiev", "London"
    ];

    var Config = {
        BASE_URL: "http://www.crowdscout.io",
        DEBUG_MODE: false,
        ENABLE_MARIONETTE_INSPECTOR_ANALYTICS: true,
        // TODO: Maybe convert DEFAULT_ADDRESS & DEFAULT_SECTION into actual objects?
        DEFAULT_ADDRESS: "Boston, MA",
        DEFAULT_SECTION: "trending",
        DEFAULT_CITIES: DEFAULT_CITIES,
        DEFAULT_SEARCH_RESULTS: (function() {
            return Array.prototype.slice.call(DEFAULT_CITIES, 0).map(function(city) {
                return {
                    address: city
                }
            })
        }()),
        placeholder_images: {
            DEFAULT: "/images/no_photo_placeholder.png",
            CATEGORY: "/images/ic_category_placeholder.png",
            USER: "/images/ic_avatar_placeholder.png"
        },
        cache_expiration: {
            // Venues expire after 5 minutes
            venues: (60 * 5),
            // Tweets expire after 30 seconds
            tweets: 30,
            // Images expire after 30 seconds
            images: 30
        },
        request_keys: {
            GET_ACTIVE_LOCATION: "active_location",
            GET_ACTIVE_SECTION: "active_section",
            GET_ACTIVE_VENUE_FILTER: "get_active_venue_filter"
        },
        command_keys: {
            CHANGE_VENUE_FILTER: "change_venue_search_type"
        },
        routes: {
            exploreVenuesNearAddress: function(address, options) {
                options || (options = {});
                return Config.BASE_URL + Utils.formatUrl(_s(routes.foursquare.explore_near_address).sprintf(address).value(), options);
            },
            getTrendingVenuesNearAddress: function(address, options) {
                options || (options = {});
                return Config.BASE_URL + Utils.formatUrl(_s(routes.foursquare.trending_near_address).sprintf(address).value(), options);
            },
            getRecentVenueMedia: function(venueId, options) {
                options || (options = {});
                return Config.BASE_URL + Utils.formatUrl(_s(routes.foursquare.recent_venue_media).sprintf(venueId).value(), options);
            },
            getMediaNearAddress: function(address, options) {
                options || (options = {});
                return Config.BASE_URL + Utils.formatUrl(_s(routes.instagram.media_near_address).sprintf(address).value(), options);
            },
            getMediaNearLocation: function(lat, lng, options) {
                options || (options = {});
                var coords = Utils.formatLatLng(lat, lng);
                return Config.BASE_URL + Utils.formatUrl(_s(routes.instagram.media_near_location).sprintf(coords.lat, coords.lng).value(), options);
            },
            getUserTweets: function(username, options) {
                options || (options = {});
                return Utils.formatUrl(_s(routes.twitter.user_tweets).sprintf(username).value(), options);
            },
            getTweetsNearLocation: function(lat, lng, options) {
                options || (options = {});
                var coords = Utils.formatLatLng(lat, lng);
                return Config.BASE_URL + Utils.formatUrl(_s(routes.twitter.tweets_near_location).sprintf(coords.lat, coords.lng).value(), options);
            },
            getTweetsNearAddress: function(address, options) {
                options || (options = {});
                return Config.BASE_URL + Utils.formatUrl(_s(routes.twitter.tweets_near_address).sprintf(address).value(), options);
            },
            getForecastForAddress: function(address, options) {
                options || (options = {});
                return Config.BASE_URL + Utils.formatUrl(_s(routes.forecast.forecast_near_address).sprintf(address).value(), options);
            },
            getSuggestedAddress: function(query, options) {
                options || (options = {});
                return Config.BASE_URL + Utils.formatUrl(_s(routes.geocoder.autocomplete).sprintf(query).value(), options);
            }
        },
        getDefaultSearchResults: function() {
            // Return a copy of the list instead of the actual list so that the recipient doesn't accidentally alter this list
            return ArrayProto.slice.call(Config.DEFAULT_SEARCH_RESULTS, 0);
        },
        toggleDebugMode: function(isActive) {
            typeof isActive !== "boolean" && (isActive = !Config.DEBUG_MODE);
            Config.DEBUG_MODE = isActive;
        }
    };

    // Required for Utils.js because it must know if DEBUG_MODE is active
    exports.DEBUG_MODE = Config.DEBUG_MODE;

    return Config;
});
