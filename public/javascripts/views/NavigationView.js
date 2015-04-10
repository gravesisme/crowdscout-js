/**
 * Created by dgraves on 3/13/15.
 */
define(["marionette", "PubSub", "Utils", "config", "text!partials/navigation.html", "views/SearchView", "models/PageModel"], function(Marionette, PubSub, Utils, Config, template, SearchView, PageModel) {
    // Flag used to determine if logging should be enabled for this class
    var DEBUG_MODE = false || Config.DEBUG_MODE;

    var NavigationView = Backbone.Marionette.LayoutView.extend({
        className: "navbar navbar-inverse navbar-fixed-top",

        tagName: "nav",

        template: _.template(template),

        regions: {
            content: "#navbar-content",
            toolbar: "#navbar-header-toolbar"
        },

        ui: {
            $logo: "a.logo",
            $toggleNavBtn: "button.navbar-toggle"
        },

        events: {
            "click @ui.$logo": function(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                PubSub.trigger("navigate", "/", true);
            }
        },

        childEvents: {
            "change:location": function(childView, msg) {
                var model = _.isObject(msg) && msg.model ? msg.model : null;

                DEBUG_MODE && console.log("NavigationView: 'change:location' triggered! arguments = ", arguments);

                if (model && model.has("address")) {
                    var address = model.get("address"),
                        section = (this.reqres.request(Config.request_keys.GET_ACTIVE_SECTION) || Config.DEFAULT_SECTION),
                        url = "explore/" + Utils.normalizeQueryParam(address) + "/" + section;

                    DEBUG_MODE && console.log("NavigationView[change:location]: url = " + url);

                    PubSub.trigger("navigate", url, true);
                }
            },
            "change:section": function(childView, section) {
                DEBUG_MODE && console.log("NavigationView: 'change:section' triggered! arguments = ", arguments);

                if (section) {
                    var address = (this.reqres.request(Config.request_keys.GET_ACTIVE_LOCATION) || Config.DEFAULT_ADDRESS),
                        url = "explore/" + Utils.normalizeQueryParam(address) + "/" + section;

                    DEBUG_MODE && console.log("NavigationView[change:section]: url = " + url);

                    PubSub.trigger("navigate", url, true);
                }
            },
            "collapse:nav": "collapseNav"
        },

        initialize: function(options) {
            options || (option = {});

            this.commands = options.commands;
            this.reqres = options.reqres;

            if (!this.model) {
                this.model = new PageModel;
            }

            // Bind content view region events to determine whether the navbar should be visible or hidden
            this.listenTo(this.content, "empty", this.onEmptyContentView, this);
            this.listenTo(this.content, "before:show", this.onBeforeShowContentView, this);
        },

        /*
        onBeforeShow: function() {
            DEBUG_MODE && console.log("NavigationView.onBeforeShow(): this.content.hasView() = ", this.content.hasView());

            // Make sure expanded is set to false initially
            //this.collapseNav();

            // Hide the toggle-nav button if there is no content to show; otherwise, show it
            this.ui.$toggleNavBtn.toggleClass("hidden", !this.content.hasView());
        },
        */

        onEmptyContentView: function(view, region, options) {
            DEBUG_MODE && console.log("NavigationView.onEmptyContentView(): arguments = ", arguments);

            // Reset navbar-content into collapsed mode to ensure next content view shown does not start off expanded
            this.collapseNav();

            // Hide the toggle-nav button when there is no content to show
            this.ui.$toggleNavBtn.addClass("hidden");
        },

        onBeforeShowContentView: function(view, region, options) {
            DEBUG_MODE && console.log("NavigationView.onBeforeShowContentView(): arguments = ", arguments);

            var $contents = view.$el.contents(),
                isEmpty = !$contents || $contents.length == 0;

            // Hide the toggle-nav button if there is no content to show; otherwise, show it
            this.ui.$toggleNavBtn.toggleClass("hidden", isEmpty);
        },

        resetToolbarView: function() {
            this.getRegion("toolbar").reset();
        },

        removeCurrentContentView: function() {
            this.getRegion("content").reset();
        },

        showContentView: function(view) {
            this.showChildView("content", view);
        },

        isNavCollapsed: function() {
            return (this.content.$el.attr("aria-expanded") == "false");
        },

        collapseNav: function() {
            DEBUG_MODE && console.log("NavigationView.collapseNav(): arguments = ", arguments);

            // Don't bother doing anything if it's already collapsed
            if (this.isNavCollapsed()) {
                return;
            }

            this.content.$el.collapse("hide");
        },

        serializeData: function() {
            var data = $.extend(true, {}, {
                title: "CrowdScout"
            }, this.model.toJSON());

            return data;
        }
    });

    return NavigationView;
});
