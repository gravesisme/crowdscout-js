/**
 * Created by dgraves on 3/18/15.
 */
define(["marionette", "Config", "Utils", "text!partials/browse_venues_layout.html", "text!partials/browse_venues_header.html", "views/VenueList", "collections/Venues", "collections/TrendingVenues"], function(Marionette, Config, Utils, template, headerTemplate, VenuesListView, VenuesCollection, TrendingVenuesCollection) {
    "use strict";

    var ArrayProto = Array.prototype;

    // Flag used to determine if logging should be enabled for this class
    var DEBUG_MODE = false || Config.DEBUG_MODE;

    // TODO: Move this to its own file
    var HeaderView = Backbone.Marionette.ItemView.extend({
        // TODO: Remove hidden-xlarge-devices if this header is every customized to not take up entire width of page; otherwise, it just stretches out the image too much and looks bad.
        className: "browseVenuesHeader hidden-xlarge-devices",
        template: _.template(headerTemplate),
        ui: {
            $well: ".well"
        },
        onRender: function() {
            var section = (this.model.get("section") || Config.DEFAULT_SECTION).toLowerCase();
            this.ui.$well.css("background-image", "url('/images/filters/" + section + ".jpg')");
        },
        serializeData: function() {
            var data = this.model.toJSON();
            data.address = Utils.humanizeAddress(data.address);
            return data;
        }
    });

    var BrowseVenuesPage = Backbone.Marionette.LayoutView.extend({
        className: "BrowseVenuesPage",

        template: _.template(template),

        regions: {
            header: ".header-container",
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

        initialize: function (options) {
            options || (options = {});

            DEBUG_MODE && console.log("BrowseVenuesPage.initialize(): arguments = ", arguments);

            this.commands = options.commands;
            this.reqres = options.reqres;
        },

        onShow: function() {
            DEBUG_MODE && console.log("BrowseVenuesPage.onShow(): arguments = ", arguments);

            // Bind requests for the active section when this page becomes active
            this.reqres.setHandler(Config.request_keys.GET_ACTIVE_LOCATION, this.onRequestActiveLocation, this);
            this.reqres.setHandler(Config.request_keys.GET_ACTIVE_SECTION, this.onRequestActiveSection, this);
        },

        onDestroy: function() {
            DEBUG_MODE && console.log("BrowseVenuesPage.onDestroy(): arguments = ", arguments);

            // Remove request handlers when this page is no longer the active page
            this.reqres.removeHandler(Config.request_keys.GET_ACTIVE_LOCATION);
            this.reqres.removeHandler(Config.request_keys.GET_ACTIVE_SECTION);
        },

        onRender: function() {
            var isTrendingRequest = this.model.get("section") === "trending",
                items = this.options && Array.isArray(this.options.items) ? ArrayProto.slice.call(this.options.items, 0) : [],
                klass = (isTrendingRequest ? TrendingVenuesCollection : VenuesCollection),
                collection = new klass(items, this.model.toJSON()),
                isEmpty = items.length === 0;

            DEBUG_MODE && console.log("BrowseVenuesPage.onRender(): items = ", items);

            // Remove items provided by initializer after first render
            if (!isEmpty) {
                this.options.items = null;
            }

            this.showListView(new VenuesListView({
                model: this.model,
                collection: collection,
                fetch: isEmpty
            }));

            this.showChildView("header", new HeaderView({
                model: this.model
            }));
        },

        onRequestActiveLocation: function() {
            var address = this.model && this.model.has("address")
                ? this.model.get("address")
                : Config.DEFAULT_ADDRESS;

            DEBUG_MODE && console.log("BrowseVenuesPage.onRequestActiveLocation(): address = ", address);

            return address;
        },

        onRequestActiveSection: function() {
            var section = this.model && this.model.has("section")
                ? this.model.get("section")
                : Config.DEFAULT_SECTION;

            DEBUG_MODE && console.log("BrowseVenuesPage.onRequestActiveSection(): section = ", section);

            return section;
        },

        onFetchStart: function() {
            DEBUG_MODE && console.log("BrowseVenuesPage.onFetchStart(): arguments = ", arguments);
            this.showLoadingIndicator();
        },

        onFetchSuccess: function(listView, collection) {
            DEBUG_MODE && console.log("BrowseVenuesPage.onFetchSuccess(): arguments = ", arguments);
            this.hideLoadingIndicator();
        },

        onFetchError: function(listView, response) {
            DEBUG_MODE && console.error("BrowseVenuesPage.onFetchError(): arguments = ", arguments);
            this.hideLoadingIndicator();

            // Reset collection if an error occurred so empty view will be shown if it is not already
            if (listView && listView.collection) {
                listView.collection.reset();
            }
        },

        showLoadingIndicator: function() {
            this.ui.$listContainer.toggleClass("loading", true);
        },

        hideLoadingIndicator: function() {
            this.ui.$listContainer.toggleClass("loading", false);
        },

        showListView: function(listView) {
            // Show view
            this.showChildView("list", listView);
        }
    });

    return BrowseVenuesPage;
});
