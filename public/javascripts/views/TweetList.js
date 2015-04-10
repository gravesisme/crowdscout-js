/**
 * Created by dgraves on 3/11/15.
 */
define(["marionette", "Utils", "config", "views/TweetListItem", "views/EmptyView"], function(Marionette, Utils, Config, TweetListItemView, EmptyView) {

    var TweetListView = Backbone.Marionette.CollectionView.extend({
        className: "tweet-items list-unstyled solid_bg",

        childView: TweetListItemView,

        tagName: "ul",

        initialize: function(options) {
            options || (options = {});

            Config.DEBUG_MODE && console.log("TweetListView.initialize(): arguments = ", arguments);

            // Used to determine if empty view should be shown
            this._fetching = false;

            // Used to determine how many times update was called
            this._updateCounter = 0;

            // Set expires time provided or use default for this class
            this._expires = (options.expires || Config.cache_expiration.tweets);

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

    return TweetListView;
});
