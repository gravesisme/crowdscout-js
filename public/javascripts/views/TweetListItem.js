/**
 * Created by dgraves on 3/11/15.
 */
define(["marionette", "config", "PubSub", "text!partials/tweet_list_item.html", "momentjs"], function(Marionette, Config, PubSub, template, moment) {

    var TweetListItem = Backbone.Marionette.ItemView.extend({
        className: "tweetListItem",

        tagName: "li",

        template: _.template(template),

        /*
        events: {
            "click": "onClick"
        },
        */

        serializeData: function() {
            var data = $.extend(true, {}, {
                categoryName: null,
                text: "",
                userImgUrl: Config.placeholder_images.USER,
                username: "UNKNOWN",
                timestamp: "UNKNOWN"
            }, this.model.toJSON());

            if (data.user) {
                data.userImgUrl = data.user.profile_image_url;
                data.username = data.user.screen_name;
            }

            data.timestamp = moment(data.created_at).fromNow();

            return data;
        },

        onClick: function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            var id = this.model.get("id_str");

            if (id && id.length > 0) {
                var url = "tweets/" + id;
                Config.DEBUG_MODE && console.log("TweetListItem.onClick(): url = " + url);
                PubSub.trigger("navigate", url, true);
            }
        }
    });

    return TweetListItem;
});
