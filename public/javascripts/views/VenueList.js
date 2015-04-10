/**
 * Created by dgraves on 3/18/15.
 */
define(["marionette", "Utils", "config", "views/VenueListItem", "views/EmptyView", "PubSub"], function(Marionette, Utils, Config, VenueListItemView, EmptyView, PubSub) {

    var VenueListView = Backbone.Marionette.CollectionView.extend({
        className: "venue-items list-unstyled solid_bg",

        childView: VenueListItemView,

        tagName: "ul",

        childEvents: {
            "show:venue": function(childView, msg) {
                var model = _.isObject(msg) && msg.model ? msg.model : null;

                Config.DEBUG_MODE && console.log("VenueListView: 'show:venue' triggered! arguments = ", arguments);

                if (model && model.has("id")) {
                    var venueId = model.get("id"),
                        url = "venues/" + venueId;

                    // Manually adding selected CSS class instead of relying on ':active'
                    // because there are too many false triggers on iOS
                    childView.$el.addClass("selected");

                    // Delay navigating to VenueDetailsPage for 50ms to allow selected CSS class to take effect in UI
                    setTimeout(function() {
                        PubSub.trigger("navigate", url, true);
                    }, 50);
                }
            }
        },

        initialize: function(options) {
            options || (options = {});

            Config.DEBUG_MODE && console.log("VenueListView.initialize(): arguments = ", arguments);

            // Used to determine if empty view should be shown
            this._fetching = false;

            // Used to determine how many times update was called
            this._updateCounter = 0;

            // Set expires time provided or use default for this class
            this._expires = (options.expires || Config.cache_expiration.venues);

            // Fetch immediately if 'fetch' attribute passed into view options
            if (options.fetch && this.collection) {
                setTimeout(this.update.bind(this), 0);
            }
        },

        getEmptyView: function() {
            if (this.isEmpty(this.collection)) {
                return EmptyView;
            }
            return null;
        },

        /**
         * Rule #1: Don't show empty view when a fetch is in progress
         * Rule #2: Don't show empty view until at least one fetch has been triggered
         */
        isEmpty: function(collection) {
            if (!collection) return true;
            if (this._fetching || this._updateCounter === 0) return false;
            return collection.length === 0;
        },

        update: function() {
            // Can't fetch without a collection and shouldn't fetch if already in progress
            if (!this.collection || this._fetching) {
                return;
            }

            // Update flags used to denote that a fetch is in progress
            this._fetching = true;
            this._updateCounter++;

            // Notify parent a fetch is starting
            this.triggerMethod("fetch:start");

            // Show empty view if necessary when fetch completes
            var onComplete = function() {
                this._fetching = false;
                this.checkEmpty();
            }.bind(this);

            // Fetch results and update parent when fetch has completed with success or error
            this.collection.fetch({
                cache: true,
                expires: this._expires,
                success: function (collection, resp, options) {
                    onComplete();
                    this.triggerMethod("fetch:success", collection);
                }.bind(this),
                error: function (collection, resp, options) {
                    onComplete();
                    this.triggerMethod("fetch:error", resp);
                }.bind(this)
            });
        }
    });

    return VenueListView;
});
