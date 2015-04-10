/**
 * Created by dgraves on 12/4/14.
 */
//"async!http://maps.google.com/maps/api/js?sensor=false"
define(["config", "Utils", "PubSub", "components/Router", "components/Controller", "components/LayoutManager", "models/PageModel", "exports"], function(Config, Utils, PubSub, Router, Controller, LayoutManager, PageModel, exports) {
    "use strict";

    // Used to control whether log messages should be shown
    var DEBUG_MODE = false || Config.DEBUG_MODE;

    var App = Marionette.Application.extend({
        _cmdHandlers: {
            "show_browse_venues_page": "onShowBrowseVenuesPage",
            "show_venue_details_page": "onShowVenueDetailsPage",
            "show_search_page": "onShowSearchPage",
            "show_landing_page": "onShowLandingPage",
            "show_search_dialog": "onShowSearchDialog"
        },

        initialize: function(options) {
            DEBUG_MODE && console.log("App.initialize(): arguments = ", arguments);

            // Setup commands that the Controller will be able to execute
            this.setupCommandHandlers();

            // Create Controller
            this.controller = new Controller({
                commands: this.commands,
                reqres: this.reqres
            });

            // Create Router and pass it Controller instance responsible for handling routes
            this.router = new Router({
                controller: this.controller
            });

            // Create LayoutManager responsible for showing active page/navigation
            this.layout = new LayoutManager({
                el: "body",
                commands: this.commands,
                reqres: this.reqres
            });

            // Bind global 'navigate' event and execute corresponding path when triggered
            PubSub.on("navigate", function(path, trigger, replace) {
                DEBUG_MODE && console.log("PubSub: navigate triggered! arguments = ", arguments);

                if (typeof trigger !== "boolean") {
                    trigger = false;
                }

                if (typeof replace !== "boolean") {
                    replace = false;
                }

                this.router.navigate(path, {
                    trigger: trigger,
                    replace: replace
                });
            }, this);

            // Bind application start event
            this.once("start", this.onStartApp, this);

            // Render the layout after everything is initialized
            this.layout.render();
        },

        setupCommandHandlers: function() {
            for (var cmd in this._cmdHandlers) {
                var handler = this._cmdHandlers[cmd],
                    func = this[handler];

                if (_.isFunction(func) ) {
                    this.commands.setHandler(cmd, func.bind(this));
                }
            }
        },

        onStartApp: function() {
            DEBUG_MODE && console.log("App.onStartApp(): arguments = ", arguments);

            // Start History with push state enabled when application is ready
            Backbone.history.start({
                pushState: true
            });
        },

        // COMMAND HANDLERS

        onShowBrowseVenuesPage: function(options) {
            DEBUG_MODE && console.log("App.onShowBrowseVenuesPage(): arguments = ", arguments);

            var settings = $.extend(true, {}, {
                address: Config.DEFAULT_ADDRESS,
                section: Config.DEFAULT_SECTION,
                items: []
            }, options || {});

            this.layout.showExploreVenuesPage(settings.address, settings.section, settings.items, settings);
        },

        onShowVenueDetailsPage: function(venueId, items) {
            DEBUG_MODE && console.log("App.onShowVenueDetailsPage(): arguments = ", arguments);
            this.layout.showVenueDetailsPage(venueId, items);
        },

        onShowSearchPage: function() {
            DEBUG_MODE && console.log("App.onShowSearchPage(): arguments = ", arguments);
            // Send any provided arguments to LayoutManager show function
            this.layout.showSearchPage.apply(this.layout, arguments);
        },

        /**
         * Current landing page behavior is to show the explore page for default address & category
         *
         * TODO: Figure out best way to handle bootstrapped content for showLandingPage
         */
        onShowLandingPage: function() {
            DEBUG_MODE && console.log("App.onShowLandingPage(): arguments = ", arguments);

            /*
             This should probably be refactored because we are currently calling
             Controller.index -> App.onShowLandingPage -> Controller.explore() instead of just calling
             LayoutManager directly. Should Controller.index() just call expore() directly to
             work around this? Although in the future, we may want to know about when landing page is shown.
             Maybe it's fine the way it currently is, ugh I dunno.
             */

            // Explore using default settings
            this.controller.explore(null, {
                reset: true
            });
        },

        onShowSearchDialog: function() {
            DEBUG_MODE && console.log("App.onShowSearchDialog(): arguments = ", arguments);

            this.layout.showSearchDialog();
        }
    });

    // Create Application
    var app = new App();

    // Make application instance available in exports to avoid circular references with Controller.js
    exports.instance = app;

    return app;
});
