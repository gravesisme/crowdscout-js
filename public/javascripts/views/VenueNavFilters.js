/**
 * Created by dgraves on 4/8/15.
 */
define(["marionette", "Config", "Utils", "text!partials/venue_nav_filter_items.html"], function(Marionette, Config, Utils, itemTemplate) {
    "use strict";

    var ArrayProto = Array.prototype;

    // Flag used to determine if logging should be enabled for this class
    var DEBUG_MODE = false || Config.DEBUG_MODE;

    // Default filters to show
    var DEFAULT_VENUE_FILTERS = [{
        searchType: "recent-media",
        link: "#recent_media",
        title: "Recent Media",
        disabled: false,
        active: true
    }, {
        searchType: "recent-tweets",
        link: "#recent_tweets",
        title: "Recent Tweets",
        disabled: false,
        active: false
    }, {
        searchType: "nearby-media",
        link: "#nearby_media",
        title: "Nearby Media",
        disabled: false,
        active: false
    }, {
        searchType: "nearby-tweets",
        link: "#nearby_tweets",
        title: "Nearby Tweets",
        disabled: false,
        active: false
    }];

    // Default active filter
    var DEFAULT_ACTIVE_VENUE_FILTER = (function() {
        var activeItem = _.findWhere(DEFAULT_VENUE_FILTERS, { "active": true });

        if (!activeItem) {
            activeItem = DEFAULT_VENUE_FILTERS[0];
        }

        return activeItem.searchType;
    }());

    var VenueNavListItemFilterView = Backbone.Marionette.ItemView.extend({
        className: "venue-details-nav-filter-item",

        tagName: "li",

        template: _.template(itemTemplate),

        modelEvents: {
            "change": "render"
        },

        events: {
            "click": "onClick"
        },

        onClick: function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            var isActive = this.model.get("active");

            DEBUG_MODE && console.log("VenueNavListItemFilterView.onClick(): isActive = " + isActive);

            // Trigger search as long as this search is not already active
            if (!isActive) {
                this.triggerMethod("execute:search", this.model.get("searchType"));
            } else {
                // Collapse nav if same filter clicked
                this.triggerMethod("collapse:nav");
            }
        },

        onBeforeRender: function() {
            var isActive = this.model.get("active");
            DEBUG_MODE && console.log("VenueNavListItemFilterView.onBeforeRender(): isActive = " + isActive)
            this.$el.toggleClass("fa fa-check", isActive);
        }
    });

    var VenueNavFiltersView = Backbone.Marionette.CollectionView.extend({
        className: "venue-nav-filters nav navbar-nav",

        tagName: "ul",

        childView: VenueNavListItemFilterView,

        childEvents: {
            "execute:search": "executeSearch"
        },

        modelEvents: {
            "change:searchType": "decorate",
            "change:contact": "toggleRecentTweets",
            "change:disableVenueFilters": "toggleVenueFilters"
        },

        initialize: function(options) {
            options || (options = {});

            DEBUG_MODE && console.log("VenueNavFiltersView.initialize(): arguments = ", arguments);

            this.commands = options.commands;
            this.reqres = options.reqres;

            // Initialize collection if not already done
            if (!this.collection) {
                this.collection = new Backbone.Collection;
            }

            // Use default venue filters if none were provided
            if (this.collection.length === 0) {
                this.collection.add(ArrayProto.slice.call(DEFAULT_VENUE_FILTERS, 0));
            }

            // Toggle recent-tweets search type based on whether current venue has a Twitter username
            this.toggleRecentTweets();
        },

        toggleRecentTweets: function() {
            var contact = this.model.get("contact"),
                enableRecentTweets = (contact && contact.twitter && contact.twitter.length > 0 ? true : false),
                recentTweetsFilter = this.collection.findWhere({ "searchType": "recent-tweets" });

            if (recentTweetsFilter) {
                recentTweetsFilter.set("disabled", !enableRecentTweets);
            }
        },

        toggleVenueFilters: function() {
            var disableVenueFilters = this.model.get("disableVenueFilters");

            this.collection.forEach(function(item) {
                var searchType = item.get("searchType");
                if (searchType.indexOf("recent") >= 0) {
                    item.set("disabled", disableVenueFilters);
                }
            });
        },

        decorate: function() {
            var searchType = this.model.get("searchType");

            DEBUG_MODE && console.log("VenueNavFiltersView.decorate(): searchType = " + searchType);

            if (!searchType) {
                console.warn("VenueNavFiltersView.decorate(): Attribute 'searchType' Not Found. Using default...");
                searchType = DEFAULT_VENUE_FILTERS[0].searchType;
            }

            this.collection.set(this.collection.map(function(item) {
                item.set("active", (item.get("searchType") === searchType));
                return item;
            }));
        },

        executeSearch: function(childView, searchType) {
            DEBUG_MODE && console.log("VenueNavFiltersView.executeSearch(): searchType = " + searchType);

            // Update model
            this.model.set("searchType", searchType);

            // Collapse navigation before triggering search
            this.triggerMethod("collapse:nav");

            // Execute CHANGE_VENUE_FILTER command and pass in new searchType
            this.commands.execute(Config.command_keys.CHANGE_VENUE_FILTER, searchType);
        }
    });

    return VenueNavFiltersView;
});
