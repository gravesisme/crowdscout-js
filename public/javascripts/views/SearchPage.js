/**
 * Created by dgraves on 4/6/15.
 */
define(["marionette", "Config", "Utils", "PubSub", "text!partials/search_page_layout.html", "text!partials/search_page_header.html", "views/SearchResultsList"], function(Marionette, Config, Utils, PubSub, pageTemplate, headerTemplate, SearchResultsListView) {
    "use strict";

    var ArrayProto = Array.prototype;

    // Flag used to determine if logging should be enabled for this class
    var DEBUG_MODE = true || Config.DEBUG_MODE;

    // TODO: Implement properly
    var SearchResultModel = Backbone.Model.extend({
        defaults: {
            address: Config.DEFAULT_ADDRESS
        },

        parse: function(response, options) {
            DEBUG_MODE && console.log("SearchResultModel.parse(): ", arguments);

            if (typeof response === "string") {

                var address = response.split(","),
                    address_str;

                if (address.length <= 1) {
                    address_str = response;
                } else {
                    address_str = address.length <= 2 ? address.join(", ") : (address[0] + ", " + address[1]);
                }

                return {
                    address: address_str
                };
            }

            return Utils.parseFetchResponse(response);
        }
    });

    var AddressSearchResultsCollection = Backbone.Collection.extend({
        model: function(attrs, options) {
            if (this._section) {
                attrs.section = this._section;
            }
            return new SearchResultModel(attrs, options);
        },

        initialize: function(models, options) {
            DEBUG_MODE && console.log("AddressSearchResults.initialize(): ", arguments);
            options || (options = {});
            this.setAddress(options.address || Config.DEFAULT_ADDRESS);

            if (options.section) {
                this._section = options.section;
            }
        },

        url: function() {
            return Config.routes.getSuggestedAddress(this._address);
        },

        parse: function(response, options) {
            return Utils.parseFetchResponse(response);
        },

        setAddress: function(address) {
            this._address = Utils.normalizeQueryParam(address);
        },

        getAddress: function() {
            return this._address;
        },

        hasAddress: function() {
            return (this._address && (this._address.length > 0));
        }
    });

    // TODO: Implement properly
    var HeaderView = Backbone.Marionette.ItemView.extend({
        className: "SearchPageHeader",
        template: _.template(headerTemplate),
        ui: {
            $input: "#search-query",
            $clearBtn: "#search-clear-btn"
        },
        events: {
            "click @ui.$clearBtn": "clearInput",
            "keyup @ui.$input": function(e) {
                // Ignore when user presses enter key
                if (e && e.keyCode === 13) return;

                // Get new input
                var val = (e && e.target) ? e.target.value.trim() : this.getInputVal(),
                    isInputEmpty = (val.length === 0);

                // Show clear button if there is input
                this.ui.$clearBtn.toggleClass("hidden", isInputEmpty);

                // Trigger event for parent to decide how to handle the updated input
                if (val !== this._lastSearchQuery) {
                    this._lastSearchQuery = val;
                    this.triggerMethod("update:list");
                }
            }
        },
        triggers: {
            "submit form": "run:search"
        },
        initialize: function (options) {
            options || (options = {});

            DEBUG_MODE && console.log("SearchPage.HeaderView.initialize(): arguments = ", arguments);

            // Used to determine whether input pulled from onKeyUp differed from last time
            this._lastSearchQuery = "";
        },
        clearInput: function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            this.ui.$clearBtn.addClass("hidden");
            this.ui.$input.val("").focus();
            this._lastSearchQuery = "";
            this.triggerMethod("update:list");
        },
        getInputVal: function() {
            return this.ui.$input.val().trim();
        },
        serializeData: function() {
            var data = $.extend(true, {}, {
                address: Config.DEFAULT_ADDRESS,
                placeholder: "Find Address"
            }, (this.model ? this.model.toJSON() : {}));

            data.address = Utils.humanizeAddress(data.address);

            return data;
        }
    });

    var SearchPage = Backbone.Marionette.LayoutView.extend({
        className: "SearchPage",

        template: _.template(pageTemplate),

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
            "fetch:error": "onFetchError",
            "run:search": "onRunSearch",
            "change:address": "onChangeAddress",
            "update:list": "onUpdateList"
        },

        initialize: function (options) {
            options || (options = {});

            DEBUG_MODE && console.log("SearchPage.initialize(): arguments = ", arguments);

            this.commands = options.commands;
            this.reqres = options.reqres;

            if (!this.model) {
                this.model = new SearchResultModel;
            }

            if (!this.model.has("address")) {
                this.model.set("address", (options.address || Config.DEFAULT_ADDRESS));
            }

            if (!this.model.has("section")) {
                this.model.set("section", (options.section || Config.DEFAULT_SECTION));
            }

            if (options.showPopularCities) {
                this.options.items = Config.getDefaultSearchResults();
            }
        },

        onRender: function() {
            var items = this.options && Array.isArray(this.options.items) ? ArrayProto.slice.call(this.options.items, 0) : [],
                collection = new AddressSearchResultsCollection(items, this.model.toJSON()),
                isEmpty = items.length === 0;

            DEBUG_MODE && console.log("SearchPage.onRender(): items = ", items);

            // Remove items provided by initializer after first render
            if (!isEmpty) {
                this.options.items = null;
            }

            // Build list view
            this.listView = new SearchResultsListView({
                model: this.model,
                collection: collection,
                //fetch: isEmpty
                fetch: false // Otherwise it would search for cities using current address as search query
            });

            // Build header view
            this.headerView = new HeaderView({
                model: this.model
            });

            this.showListView(this.listView);
            this.showChildView("header", this.headerView);
        },

        showDefaultSearchResults: function() {
            this.listView.collection.reset(Config.getDefaultSearchResults());
        },

        onUpdateList: function() {
            var searchQuery = this.headerView.getInputVal();

            DEBUG_MODE && console.log("SearchPage.onUpdateList(): searchQuery = ", searchQuery);

            // Show default search results when there is no input
            if (searchQuery.length === 0) {
                this.showDefaultSearchResults();
                return;
            }

            // Otherwise, clear previous results. This will also ensure
            // that any previously added empty view is destroyed
            this.listView.collection.reset();
        },

        onRunSearch: function(view, msg) {
            DEBUG_MODE && console.log("SearchPage.onRunSearch(): arguments = ", arguments);
            var searchQuery = this.headerView.getInputVal();

            // Don't do anything if there is nothing to search for
            if (searchQuery.length === 0) {
                return;
            }

            // Otherwise, perform the search
            this.listView.search(searchQuery);
        },

        onChangeAddress: function(view, msg) {
            DEBUG_MODE && console.log("SearchPage.onChangeAddress(): arguments = ", arguments);

            var model = _.isObject(msg) && msg.model ? msg.model : null;

            if (model && model.has("address")) {
                var address = model.get("address"),
                    section = this.model.get("section"),
                    url = "explore/" + Utils.normalizeQueryParam(address) + "/" + section;

                DEBUG_MODE && console.log("NavigationView[change:location]: url = " + url);

                PubSub.trigger("navigate", url, true);
            }
        },

        onFetchStart: function() {
            DEBUG_MODE && console.log("SearchPage.onFetchStart(): arguments = ", arguments);
            this.showLoadingIndicator();
        },

        onFetchSuccess: function(listView, collection) {
            DEBUG_MODE && console.log("SearchPage.onFetchSuccess(): arguments = ", arguments);
            this.hideLoadingIndicator();
        },

        onFetchError: function(listView, response) {
            DEBUG_MODE && console.log("SearchPage.onFetchError(): NO RESULTS FOUND! arguments = ", arguments);
            this.hideLoadingIndicator();
            this.listView.collection.reset();
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

    return SearchPage;
});