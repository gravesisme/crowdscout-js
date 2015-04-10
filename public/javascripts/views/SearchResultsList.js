/**
 * Created by dgraves on 4/6/15.
 */
define(["marionette", "Utils", "Config", "views/EmptyView", "text!partials/search_result_list_item.html"], function(Marionette, Utils, Config, EmptyView, template) {

    // Flag used to determine if logging should be enabled for this class
    var DEBUG_MODE = true || Config.DEBUG_MODE;

    var SearchResultsListItemView = Backbone.Marionette.ItemView.extend({
        className: "searchResultListItem",

        tagName: "li",

        template: _.template(template),

        triggers: {
            "click": "change:address"
        },

        serializeData: function () {
            var data = $.extend(true, {}, {
                address: Config.DEFAULT_ADDRESS
            }, this.model.toJSON());

            data.address = Utils.humanizeAddress(data.address);
            data.addressParam = Utils.normalizeQueryParam(data.address);


            if (data.section) {
                data.section = data.section.toLowerCase();
            }

            return data;
        }
    });

    var SearchResultsListView = Backbone.Marionette.CollectionView.extend({
        className: "searchResults list-unstyled solid_bg",

        childView: SearchResultsListItemView,

        tagName: "ul",

        initialize: function(options) {
            options || (options = {});

            DEBUG_MODE && console.log("SearchResultsListView.initialize(): arguments = ", arguments);

            // Used to determine if empty view can be shown
            this._emptyViewEnabled = false;

            if (options.fetch && this.collection) {
                setTimeout(this.search.bind(this), 0);
            }
        },

        search: function(address) {
            if (!this.collection) {
                console.error("SearchResultsListView.search(): No collection defined!");
                return;
            }

            // Update address if a new one was provided
            if (typeof address === "string") {
                this.collection.setAddress(address);
            }

            // Make sure there is an address to search for
            if (!this.collection.hasAddress()) {
                DEBUG_MODE && console.log("SearchResultsListView.search(): No address defined! Showing Popular Cities...");
                this.collection.reset(Config.getDefaultSearchResults());
                return;
            }

            // Notify parent a fetch is starting
            this.triggerMethod("fetch:start");

            // Show empty view if necessary when fetch completes
            var onComplete = function() {
                this._emptyViewEnabled = true;
                this.checkEmpty();
            }.bind(this);

            this.collection.fetch({
                cache: true,
                expires: false,
                success: function (collection, resp, options) {
                    this.triggerMethod("fetch:success", collection);
                    onComplete();
                }.bind(this),
                error: function (collection, resp, options) {
                    this.triggerMethod("fetch:error", resp);
                    onComplete();
                }.bind(this)
            });
        },

        /**
         * Since we don't want to show 'No Results Found' while the user is typing,
         * disable empty view and remove any empty views previously added.
         *
         * This event will be triggered by any operations that update the collection.
         */
        onBeforeRender: function() {
            this._emptyViewEnabled = false;
            this.destroyEmptyView();
        },

        getEmptyView: function() {
            if (this._emptyViewEnabled) {
                return EmptyView;
            }
            return null;
        }
    });

    return SearchResultsListView;
});
