/**
 * Created by dgraves on 3/11/15.
 */
define(["backbone", "config", "Utils", "models/Tweet"], function(Backbone, Config, Utils, TweetModel) {

    var RecentTweetsCollection = Backbone.Collection.extend({
        model: TweetModel,

        initialize: function(models, options) {
            Config.DEBUG_MODE && console.log("RecentTweetsCollection.initialize(): ", arguments);
            options || (options = {});
            this._username = options.username;
        },

        url: function() {
            Config.DEBUG_MODE && console.log("RecentTweetsCollection.url() triggered!");
            return Config.routes.getUserTweets(this._username);
        },

        parse: function(response, options) {
            Config.DEBUG_MODE && console.log("RecentTweetsCollection.parse(): ", arguments);
            return Utils.parseFetchResponse(response);
        },

        setUsername: function(username) {
            this._username = username;
        }
    });

    return RecentTweetsCollection;
});
