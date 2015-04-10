/**
 * Created by dgraves on 3/13/15.
 */
define(["marionette", "PubSub", "Utils", "config", "collections/LocationSearchResults", "views/LocationSearchResultItem", "text!partials/search_container.html"], function(Marionette, PubSub, Utils, Config, LocationSearchResults, LocationSearchResultItemView, template) {
    // Flag used to determine if logging should be enabled for this class
    var DEBUG_MODE = false || Config.DEBUG_MODE;

    var SearchView = Backbone.Marionette.CompositeView.extend({
        _searchDelay: 500,
        _onBlurDelay: 250,

        className: "search-container navbar-right",

        template: _.template(template),

        templateHelpers: {
            equalsIgnoreCase: function(s1, s2) {
                return s1.trim().toLowerCase() == s2.trim().toLowerCase();
            }
        },

        attributes: {
            "role": "search"
        },

        childViewContainer: ".search-results",

        childView: LocationSearchResultItemView,

        ui: {
            $input: "#search-query",
            $results: ".search-results",
            $indicator: ".indicator"
        },

        modelEvents: {
            "change": "render"
        },

        events: {
            "click .search-filter": "onSearchFilterClicked",
            /*
            "click": function(e) {
                if (this.$el.hasClass("collapsed")) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.$el.removeClass("collapsed");
                }
            },
            "click @ui.$input": function(e) {
                e.preventDefault();
                if (this.collection.length > 0) {
                    this.ui.$results.show();
                }
            },
            "click .clear_search": function(e) {
                e.preventDefault();
                this.reset();
            },
            */
            "click @ui.$indicator": function(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                /*
                if (this.ui.$indicator.hasClass("fa-remove")) {
                    this.reset();
                }
                */

                this.reset();
                this.ui.$input.focus();
            },
            "blur @ui.$input": "onBlur",
            "focus @ui.$input": "onFocus",
            "keyup @ui.$input": "onKeyUp"

        },

        onBlur: _.debounce(function(e) {
            // If a previously onBlurDelay has not been triggered yet, remove it now
            if (this._delayedOnBlur) {
                clearTimeout(this._delayedOnBlur);
                this._delayedOnBlur = null;
            }

            //this._delayedOnBlur = setTimeout(function() {
                this._delayedOnBlur = null;
                if ((typeof this.ui.$input !== "string") && !this.ui.$input.is(":focus")) {
                    this.ui.$indicator
                        .addClass("fa-search")
                        .removeClass("fa-remove fa-spinner fa-spin");

                    // Hide results
                    this.ui.$results.hide();
                }
            //}.bind(this), this._onBlurDelay);
        }, 250, false),

        onFocus: function(e) {
            this.ui.$indicator
                .addClass("fa-remove")
                .removeClass("fa-search fa-spinner fa-spin");

            if (this.collection.length > 0) {
                this.ui.$results.show();
            }
        },

        onKeyUp: _.debounce(function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            var query = this.ui.$input.val().trim();

            // If a previously delayedSearch has not been triggered yet, remove it now
            if (this._delayedSearch) {
                clearTimeout(this._delayedSearch);
                this._delayedSearch = null;
            }

            if (this._lastSearch === query) {
                console.log("Skipping query...");
                return;
            } else {
                console.log("this._lastSearch (" + this._lastSearch + ") !== query (" + query + ")");
            }

            // Return
            if (e.keyCode == 13) {
                this.findPlace(query);
                this._lastSearch = query;
                return false;
            }

            // Any other key
            else {
                // Hide previous results if they are different than the last search results
                if (this._lastSearch && query !== this._lastSearch) {
                    this.ui.$results.hide();
                    this.collection.reset();
                }

                // Hide indicator if query is empty
                if (query.length === 0) {
                    // TODO: Figure out how i should use ui.$indicator
                    //this.ui.$indicator.hide();
                }

                // Otherwise, show indicator and setup delayed search
                else {
                    // TODO: Figure out how i should use ui.$indicator
                    //this.ui.$indicator.show();

                    // Delayed search will be triggered unless user types something else before delay expires
                    //this._delayedSearch = setTimeout(function() {
                        this._delayedSearch = null;
                        this.findAddress(query);
                        this._lastSearch = query;
                    //}.bind(this), this._searchDelay);
                }
            }
        }, 250, false),

        initialize: function(options) {
            options || (option = {});

            this.commands = options.commands;
            this.reqres = options.reqres;

            // Define attributes that will be bound later
            this._delayedSearch = null;
            this._delayedOnBlur = null;
            this._xhr = null;

            // Define search model
            if (!this.model) {
                this.model = new Backbone.Model({
                    address: Config.DEFAULT_ADDRESS
                });
            }

            // Define collection
            if (!this.collection) {
                var address = !this.model.has("address") ? Config.DEFAULT_ADDRESS : this.model.get("address");
                this.collection = new LocationSearchResults([], {
                    address: address
                });
            }

            if (!this.model.has("address")) {
                this.model.set({
                    address: Config.DEFAULT_ADDRESS
                }, {
                    silent: true
                });
            }

            // Set last search to current value
            this._lastSearch = this.model.get("address");

            console.log("SearchView.initialize(): this._lastSearch = " + this._lastSearch);
        },

        onDestroy: function() {
            console.log("SearchView.onDestroy(): arguments = ", arguments);

            // If a previously delayedSearch has not been triggered yet, remove it now
            if (this._delayedSearch) {
                clearTimeout(this._delayedSearch);
                this._delayedSearch = null;
            }

            if (this._delayedOnBlur) {
                clearTimeout(this._delayedOnBlur);
                this._delayedOnBlur = null;
            }
        },

        onRender: function() {
            console.log("SearchView.onRender(): arguments = ", arguments);
            this.ui.$results.hide();
        },

        onSearchFilterClicked: function(e) {
            DEBUG_MODE && console.log("SearchView.onSearchFilterClicked(): arguments = ", arguments);

            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            var $el = $(e.target);

            this.triggerMethod("change:section", $el.data("search-type"))
        },

        clearInput: function() {
            this.ui.$input.val("");
        },

        reset: function() {
            this.ui.$input.val("");
            this.ui.$results.hide();
            // TODO: Figure out how i should use ui.$indicator
            //this.ui.$indicator.hide();
            this.collection.reset();

            // TODO: Revisit this once I have decided whether the model owned by this view will be shared throughout app. If so, only clear the field being modified by SearchView.
            //this.model.clear();
        },

        findAddress: function(query) {
            if (!query) {
                return;
            }

            // abort search in progress
            this.abortSearch();

            this.ui.$results.hide();

            this.collection.reset();

            // TODO: Figure out how i should use ui.$indicator
            this.ui.$indicator
                .addClass("fa-spinner fa-spin");
                //.removeClass("fa-remove fa-search");

            this.collection.setAddress(query);

            // TODO: Replace fetch call with $.ajax because fetch cannot be aborted
            this.collection.fetch({
                cache: true,
                expires: false,
                success: function (collection, resp, options) {
                    //this.triggerMethod("fetch:success", collection);
                    // TODO: Figure out how i should use ui.$indicator
                    this.ui.$indicator
                        //.addClass("fa-search")
                        .removeClass("fa-spinner fa-spin");
                    this.ui.$results.show();
                }.bind(this),
                error: function (collection, resp, options) {
                    //this.triggerMethod("fetch:error", resp);
                    // TODO: Figure out how i should use ui.$indicator
                    this.ui.$indicator
                        //.addClass("fa-search")
                        .removeClass("fa-spinner fa-spin");
                    this.ui.$results.show();
                    this.collection.reset([{
                        icon: "",
                        title: "There was problem searching for places, please try again",
                        vicinity: ""
                    }]);
                }.bind(this)
            });
        },

        abortSearch: function() {
            // abort search in progress
            if (this._xhr) {
                this._xhr.abort();
            }
        },

        serializeData: function() {
            var data = $.extend(true, {}, {
                address: Config.DEFAULT_ADDRESS,
                section: Config.DEFAULT_SECTION,
                placeholder: "Find Address"
            }, this.model.toJSON());

            data.address = Utils.humanizeAddress(data.address);
            data.section = Utils.capitalize(data.section.toLowerCase());

            data.addressParam = Utils.normalizeQueryParam(data.address);
            data.sectionParam = data.section.toLowerCase();

            return data;
        }
    });

    return SearchView;
});
