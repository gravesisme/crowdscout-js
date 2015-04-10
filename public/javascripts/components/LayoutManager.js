/**
 * Created by dgraves on 3/3/15.
 */
define(["marionette", "config", "text!partials/main_layout.html", "text!partials/dialog.html", "views/NavigationView", "views/SearchButtonView", "views/VenueDetailsPage", "views/BrowseVenuesPage", "views/SearchPage", "views/SearchView", "views/VenueNavFilters", "models/PageModel", "models/Venue", "models/BrowseVenuesPageModel"], function(Marionette, Config, template, dialogTemplate, NavigationView, SearchButtonView, VenueDetailsPage, BrowseVenuesPage, SearchPage, SearchView, VenueNavFiltersView, PageModel, VenueModel, BrowseVenuesPageModel) {
    var ArrayProto = Array.prototype;

    // Flag used to determine if logging should be enabled for this class
    var DEBUG_MODE = false || Config.DEBUG_MODE;

    // Tags used to keep track of active view
    var BROWSE_VENUES_PAGE_TAG = "BrowseVenuesPage",
        VENUE_DETAILS_PAGE_TAG = "VenueDetailsPage",
        SEARCH_PAGE_TAG = "SearchPage",
        KEEP_TRACK_OF_ACTIVE_PAGE = false;

    var _dialogTemplate = _.template(dialogTemplate);

    var LayoutManager = Backbone.Marionette.LayoutView.extend({
        template: _.template(template),

        regions: {
            navigation: "#navigation",
            content: "#content",
            dialogs: "#dialogs"
        },

        initialize: function (options) {
            options || (options = {});

            DEBUG_MODE && console.log("LayoutManager.initialize(): arguments = ", arguments);

            this.commands = options.commands;
            this.reqres = options.reqres;

            this.navigationView = new NavigationView({
                model: new PageModel,
                commands: this.commands,
                reqres: this.reqres
            });

            // Used to keep track of active content
            if (KEEP_TRACK_OF_ACTIVE_PAGE) {
                this._currentPage = {
                    identifier: null,
                    view: null
                };
            }
        },

        onRender: function() {
            DEBUG_MODE && console.log("LayoutManager.onRender(): arguments = ", arguments);

            // Show navigation
            this.showChildView("navigation", this.navigationView);
        },

        showExploreVenuesPage: function(address, section, venues, options) {
            // Validate arguments
            address || (address = Config.DEFAULT_ADDRESS);
            section || (section = Config.DEFAULT_SECTION);
            venues || (venues = []);
            options || (options = {});

            var items = [],
                model = new BrowseVenuesPageModel({
                    address: address,
                    section: section
                }),
                view;

            // If venues passed in is a collection, convert it to a regular array
            if (venues instanceof Backbone.Collection) {
                venues = venues.toJSON();
            }

            // Add all the venues to the items array
            if (Array.isArray(venues)) {
                ArrayProto.push.apply(items, venues);
            }

            // Initialize page view
            view = new BrowseVenuesPage({
                items: items,
                model: model,
                commands: this.commands,
                reqres: this.reqres
            });

            // Keep a reference in case it needs to be updated
            if (KEEP_TRACK_OF_ACTIVE_PAGE) {
                this._currentPage = {
                    identifier: BROWSE_VENUES_PAGE_TAG,
                    view: view
                };
            }

            // Show view
            this.showChildView("content", view);

            // Show search view
            this.navigationView.showContentView(new SearchView({
                model: model,
                commands: this.commands,
                reqres: this.reqres
            }));

            // Add search button to nav-header toolbar
            this.navigationView.showChildView("toolbar", new SearchButtonView({
                commands: this.commands,
                reqres: this.reqres
            }));
        },

        showVenueDetailsPage: function(venueId, images, options) {
            // Validate arguments
            images || (images = []);
            options || (options = {});

            var items = [],
                searchType = (options.searchType || "recent-media"),
                model = new VenueModel({
                    id: venueId,
                    searchType: searchType
                }),
                view;

            // If images passed in is a collection, convert it to a regular array
            if (images instanceof Backbone.Collection) {
                images = images.toJSON();
            }

            // Add all the images to the items array
            if (Array.isArray(images)) {
                ArrayProto.push.apply(items, images);
            }

            // Initialize page view
            view = new VenueDetailsPage({
                items: items,
                model: model,
                searchType: searchType,
                commands: this.commands,
                reqres: this.reqres
            });

            // Keep a reference in case it needs to be updated
            if (KEEP_TRACK_OF_ACTIVE_PAGE) {
                this._currentPage = {
                    identifier: VENUE_DETAILS_PAGE_TAG,
                    view: view
                };
            }

            // Show view
            this.showChildView("content", view);

            // Show Venue Filters in Collapsed Navigation Content View
            this.navigationView.showContentView(new VenueNavFiltersView({
                model: model,
                searchType: searchType,
                commands: this.commands,
                reqres: this.reqres
            }));

            // Make sure toolbar buttons from previous page is not visible
            this.navigationView.resetToolbarView();
        },

        showSearchPage: function() {
            var address = (this.reqres.request(Config.request_keys.GET_ACTIVE_LOCATION) || Config.DEFAULT_ADDRESS),
                section = (this.reqres.request(Config.request_keys.GET_ACTIVE_SECTION) || Config.DEFAULT_SECTION);

            DEBUG_MODE && console.log("LayoutManager.showSearchPage(): data = ", {
                address: address,
                section: section
            });

            // Initialize page view
            var view = new SearchPage({
                //items: items,
                //model: model,
                address: address,
                section: section,
                showPopularCities: true,
                commands: this.commands,
                reqres: this.reqres
            });

            // Keep a reference in case it needs to be updated
            if (KEEP_TRACK_OF_ACTIVE_PAGE) {
                this._currentPage = {
                    identifier: SEARCH_PAGE_TAG,
                    view: view
                };
            }

            // Show page view
            this.showChildView("content", view);

            // Remove previous page's navigation content view
            // TODO: Instead of removing content view, show navigation content view specific to the page being shown
            this.navigationView.removeCurrentContentView();

            // Remove previous page's navigation toolbar view
            this.navigationView.resetToolbarView();
        },

        // TODO: Implement
        showSearchDialog: function() {
            DEBUG_MODE && console.log("LayoutManager.showSearchDialog()");

            if (this._$dialog) {
                this._$dialog.find("#activeModal").modal("hide");
                this._$dialog.innerHTML = "";
            }

            this._$dialog = $("#dialogs");
            this._$dialog.html(_dialogTemplate({ title: "Find Address" }));

            /*
            var address = (this.reqres.request(Config.request_keys.GET_ACTIVE_LOCATION) || Config.DEFAULT_ADDRESS),
                section = (this.reqres.request(Config.request_keys.GET_ACTIVE_SECTION) || Config.DEFAULT_SECTION),
                model = new Backbone.Model({
                    address: address,
                    section: section
                }),
                searchView;

            searchView = new SearchView({
                model: model,
                commands: this.commands,
                reqres: this.reqres
            });

            this._$dialog.find(".modal-body").append(searchView.el);
            */
            this._$dialog.find(".modal-dialog").css({
                "position": "absolute",
                "top": "0",
                "bottom": "0"
            });
            this._$dialog.find(".modal-content").css("height", "100%");
            this._$dialog.find(".modal-body").html("<h1>Under Construction...</h1>");
            this._$dialog.find("#activeModal").modal({ show: true });
        }
    });

    return LayoutManager;
});
