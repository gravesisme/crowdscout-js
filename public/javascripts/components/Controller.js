/**
 * Created by dgraves on 3/5/15.
 */
define(["marionette", "Utils", "Config", "collections/Venues", "collections/RecentMedia", "bootstrapped_content"], function(Marionette, Utils, Config, VenuesCollection, RecentMediaCollection, bootstrapped_content) {
    var ArrayProto = Array.prototype;

    // Flag used to determine if logging should be enabled for this class
    var DEBUG_MODE = true || Config.DEBUG_MODE;

    var Controller = Backbone.Marionette.Object.extend({
        initialize: function (options) {
            options || (options = {});

            DEBUG_MODE && console.log("Controller.initialize(): arguments = ", arguments);

            this.commands = options.commands;
            this.reqres = options.reqres;
        },

        index: function() {
            DEBUG_MODE && console.log("Controller.index(): arguments = ", arguments);
            this.commands.execute("show_landing_page");
        },

        search: function() {
            DEBUG_MODE && console.log("Controller.search(): arguments = ", arguments);
            this.commands.execute("show_search_page");
        },

        explore: function (path, options) {
            path || (path = "");
            options || (options = {});

            var isBootstrapped = (bootstrapped_content && _.isArray(bootstrapped_content.explore)),
                items = !isBootstrapped ? [] : ArrayProto.slice.call(bootstrapped_content.explore, 0),
                args, address, section, pageData;

            // Split path into address and section
            args = path.length === 0 ? [] : path.split("/").map(function(param, i) {
                if (param.length === 0) return null;
                return Utils.normalizeQueryParam(param);
            }).filter(function(param) {
                return (param !== null);
            });

            // Use the address provided in the path, if available; otherwise, request the active location
            if (args.length > 0) {
                address = args[0];
            } else {
                // Otherwise, request the active address as long as reset option was not passed in
                if (!options.reset) {
                    address = this.reqres.request(Config.request_keys.GET_ACTIVE_LOCATION);
                }

                // If there is no active address, use the default
                if (!address) {
                    Config.DEFAULT_ADDRESS;
                }
            }

            // Use the section provided in the path, if available
            if (args.length > 1) {
                section = args[1];
            } else {
                // Otherwise, request the active section as long as reset option was not passed in
                if (!options.reset) {
                    section = this.reqres.request(Config.request_keys.GET_ACTIVE_SECTION);
                }

                // If there is no active section, use the default
                if (!section) {
                    Config.DEFAULT_SECTION;
                }
            }

            // TODO: Figure out a more generic way to do this that can be applied to showing other pages w/ bootstrapped content
            // Use items passed to controller if they exist
            if (isBootstrapped && (items.length > 0)) {
                DEBUG_MODE && console.log("Controller.explore(" + address + ", " + section + "): Saving Bootstrapped Models");

                // Backbone.fetchCache.setCache requires a Backbone Collection, so build one using bootstrapped items
                var collection = new VenuesCollection(items, {
                    address: address,
                    section: section
                });

                // Delete bootstrapped content once it has been used; these should only be used on page load, otherwise they would become stale
                bootstrapped_content.explore = null;

                // Cache bootstrapped content for this particular path in case user presses back button
                Backbone.fetchCache.setCache(collection, {
                    cache: true,
                    expires: Config.cache_expiration.venues
                }, {
                    code: "200",
                    status: "OK",
                    data: ArrayProto.slice.call(items, 0)
                });
            }

            // Define page data to show
            pageData = {
                address: address,
                section: section,
                items: items
            };

            DEBUG_MODE && console.log("Controller.explore(): Executing 'show_browse_venues_page' command with data: ", pageData);

            // Execute show command with provided page data
            this.commands.execute("show_browse_venues_page", pageData);
        },

        venueDetails: function(venueId) {
            DEBUG_MODE && console.log("Controller.venue(" + venueId + ")");

            var isBootstrapped = (bootstrapped_content && _.isArray(bootstrapped_content.venue_details)),
                items = !isBootstrapped ? [] : ArrayProto.slice.call(bootstrapped_content.venue_details, 0);

            // TODO: Figure out a more generic way to do this that can be applied to showing other pages w/ bootstrapped content
            // Use items passed to controller if they exist
            if (isBootstrapped && (items.length > 0)) {
                DEBUG_MODE && console.log("Controller.venueDetails(" + venueId + "): Saving Bootstrapped Models");

                // Backbone.fetchCache.setCache requires a Backbone Collection, so build one using bootstrapped items
                var images = new RecentMediaCollection(items, {
                    venueId: venueId
                });

                // Delete bootstrapped content once it has been used; these should only be used on page load, otherwise they would become stale
                bootstrapped_content.venue_details = null;

                // Cache bootstrapped content for this particular venueId in case user presses back button
                Backbone.fetchCache.setCache(images, {
                    cache: true,
                    expires: Config.cache_expiration.images
                }, {
                    code: "200",
                    status: "OK",
                    data: ArrayProto.slice.call(items, 0)
                });
            }

            DEBUG_MODE && console.log("Controller.venueDetails(): Executing 'show_venue_details_page' command with data: ", venueId, items);

            // Execute show command with provided page data
            this.commands.execute("show_venue_details_page", venueId, items);
        }
    });

    return Controller;
});
