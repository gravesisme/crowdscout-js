/**
 * Created by dgraves on 3/5/15.
 */
define(["marionette", "PubSub", "config", "text!partials/media_list_item.html", "momentjs"], function(Marionette, PubSub, Config, template, moment) {

    var MediaListItem = Backbone.Marionette.ItemView.extend({
        className: "mediaListItem",

        tagName: "li",

        template: _.template(template),

        /*
        events: {
            "click": function(e) {
                e && e.preventDefault();
                e && e.stopPropagation();
                var venueId = this.model.get("id");
                if (venueId && venueId.length > 0) {
                    var url = "venues/" + venueId;
                    console.log("VenueListItem.onClick(): url = " + url);
                    PubSub.trigger("navigate", url, true);
                }
            }
        },
        */

        serializeData: function() {
            var data = $.extend(true, {}, {
                imageUrl: Config.placeholder_images.DEFAULT,
                userImgUrl: Config.placeholder_images.USER,
                username: "",
                timestamp: "",
                videoUrl: "",
                isVideo: false
            }, this.model.toJSON());

            if (data.videos && data.videos.standard_resolution && data.videos.standard_resolution.url) {
                data.videoUrl = data.videos.standard_resolution.url;
                data.isVideo = true;
            }

            if (data.images && data.images.standard_resolution && data.images.standard_resolution.url) {
                data.imageUrl = data.images.standard_resolution.url;
                data.maxWidth = data.images.standard_resolution.width;
            }

            if (data.user) {
                data.userImgUrl = data.user.profile_picture;
                data.username = data.user.username;
            }

            // Format the timestamp based on how recently it occurred
            var timestamp = moment(data.created_time);
            if (!timestamp.isBefore(moment().subtract(22, "hours"))) {
                data.timestamp = timestamp.fromNow();
            } else if (!timestamp.isSame(moment(), "year")) {
                data.timestamp = timestamp.format("MMMM DD[,] YYYY");
            } else {
                data.timestamp = timestamp.calendar();
            }

            return data;
        }
    });

    return MediaListItem;
});
