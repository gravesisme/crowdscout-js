/**
 * Created by dgraves on 3/11/15.
 */
define(["marionette", "Config", "text!partials/venue_details_layout.html", "collections/RecentMedia", "collections/NearbyMedia", "collections/RecentTweets",  "collections/NearbyTweets", "views/VenueDetailsDashboard", "views/MediaList", "views/TweetList"], function(Marionette, Config, template, RecentMediaCollection, NearbyMediaCollection, RecentTweetsCollection, NearbyTweetsCollection, DashboardView, MediaListView, TweetListList) {
    "use strict";

    var ArrayProto = Array.prototype;

    // Flag used to determine if logging should be enabled for this class
    var DEBUG_MODE = false || Config.DEBUG_MODE;

    var VenueDetailsPage = Backbone.Marionette.LayoutView.extend({
        className: "VenueDetailsPage",

        template: _.template(template),

        regions: {
            dashboard: ".dashboard-container",
            list: ".list-container"
        },

        ui: {
            $listContainer: ".list-container"
        },

        childEvents: {
            "fetch:start": "onFetchStart",
            "fetch:success": "onFetchSuccess",
            "fetch:error": "onFetchError"
        },

        modelEvents: {
            "change:searchType": "updateListView"
        },

        initialize: function (options) {
            options || (options = {});

            DEBUG_MODE && console.log("VenueDetailsPage.initialize(): arguments = ", arguments);

            this.commands = options.commands;
            this.reqres = options.reqres;

            if (!this.model.has("searchType")) {
                this.model.set("searchType", "recent-media");
            }

            if (!this.model.has("name")) {
                this.model.fetch({
                    cache: true,
                    expires: false
                });
            }

            this.dashboardView = new DashboardView({
                model: this.model
            });
        },

        onRender: function() {
            DEBUG_MODE && console.log("VenueDetailsPage.onRender(): arguments = ", arguments);

            // Show dashboard
            this.showChildView("dashboard", this.dashboardView);

            // Show list view
            this.updateListView();
        },

        onShow: function() {
            DEBUG_MODE && console.log("VenueDetailsPage.onShow(): arguments = ", arguments);

            // Bind commands & requests when this page becomes active
            this.commands.setHandler(Config.command_keys.CHANGE_VENUE_FILTER, this.updateSearchType, this);
            this.reqres.setHandler(Config.request_keys.GET_ACTIVE_VENUE_FILTER, this.onRequestActiveVenueSearchType, this);
        },

        onDestroy: function() {
            DEBUG_MODE && console.log("VenueDetailsPage.onDestroy(): arguments = ", arguments);

            // UNBIND commands & requests when this page is destroyed
            this.commands.removeHandler(Config.command_keys.CHANGE_VENUE_FILTER);
            this.reqres.removeHandler(Config.request_keys.GET_ACTIVE_VENUE_FILTER);
        },

        updateSearchType: function(searchType) {
            DEBUG_MODE && console.log("VenueDetailsPage.updateSearchType(): arguments = ", arguments);
            this.model.set("searchType", searchType);
        },

        // TODO: Not sure if needed anymore
        onRequestActiveVenueSearchType: function() {
            var searchType = this.model.get("searchType");
            DEBUG_MODE && console.log("VenueDetailsPage.onRequestActiveVenueSearchType(): searchType = ", searchType);
            return searchType;
        },

        onFetchStart: function() {
            DEBUG_MODE && console.log("VenueDetailsPage.onFetchStart(): arguments = ", arguments);
            this.showLoadingIndicator();
        },

        onFetchSuccess: function(listView, collection) {
            DEBUG_MODE && console.log("VenueDetailsPage.onFetchSuccess(): arguments = ", arguments);
            this.hideLoadingIndicator();
        },

        onFetchError: function(listView, response) {
            DEBUG_MODE && console.log("VenueDetailsPage.onFetchError(): Venue does not exist in Instagram DB! arguments = ", arguments);

            // When a venue cannot be found in the Instagram DB, hide all venue specific filters and use location-filters only
            this.hideLoadingIndicator();

            // Hide venue specific filters
            this.dashboardView.hideVenueFilters();

            // Change search type to 'nearby-media'
            this.model.set("searchType", "nearby-media");
        },

        showLoadingIndicator: function() {
            this.ui.$listContainer.toggleClass("loading", true);
        },

        hideLoadingIndicator: function() {
            this.ui.$listContainer.toggleClass("loading", false);
        },

        showRecentMedia: function(items) {
            items || (items = []);

            var images = new RecentMediaCollection(items, {
                venueId: this.model.get("id")
            });

            this.showListView(new MediaListView({
                collection: images,
                fetch: items.length === 0
            }));
        },

        showNearbyMedia: function(items) {
            items || (items = []);

            var coords = this.model.get("location");

            var images = new NearbyMediaCollection(items, {
                lat: coords.lat,
                lng: coords.lng
            });

            this.showListView(new MediaListView({
                collection: images,
                fetch: items.length === 0
            }));
        },

        showNearbyTweets: function(items) {
            items || (items = []);

            var coords = this.model.get("location");

            var tweets = new NearbyTweetsCollection(items, {
                lat: coords.lat,
                lng: coords.lng
            });

            this.showListView(new TweetListList({
                collection: tweets,
                fetch: items.length === 0
            }));
        },

        showRecentTweets: function(items) {
            items || (items = []);

            var contact = this.model.get("contact");

            var tweets = new RecentTweetsCollection(items, {
                username: contact.twitter
            });

            this.showListView(new TweetListList({
                collection: tweets,
                fetch: items.length === 0
            }));
        },

        updateListView: function() {
            var searchType = this.model.get("searchType"),
                items = this.options && Array.isArray(this.options.items)
                ? ArrayProto.slice.call(this.options.items, 0) : [];

            DEBUG_MODE && console.log("VenueDetailsPage.updateListView(" + searchType + "): items = ", items);

            // Remove items provided by initializer after first render
            if (items.length > 0) {
                this.options.items = null;
            }

            // Figure out which ListView should be shown
            if (searchType === "recent-media") {
                this.showRecentMedia(items);
            }

            else if (searchType === "nearby-media") {
                this.showNearbyMedia(items);
            }

            else if (searchType === "recent-tweets") {
                this.showRecentTweets(items);
            }

            else if (searchType === "nearby-tweets") {
                this.showNearbyTweets(items);
            }
        },

        showListView: function(listView) {
            // Show view
            this.showChildView("list", listView);
        }
    });

    return VenueDetailsPage;
});
