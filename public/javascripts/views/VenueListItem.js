/**
 * Created by dgraves on 3/3/15.
 */
define(["marionette", "PubSub", "config", "text!partials/venue_list_item.html"], function(Marionette, PubSub, Config, template) {

    var VenueListItem = Backbone.Marionette.ItemView.extend({
        className: "venueListItem container-abs",

        tagName: "li",

        template: _.template(template),

        triggers: {
            "click": "show:venue"
        },

        serializeData: function() {
            var data = $.extend(true, {}, {
                categoryName: null,
                categoryIconUrl: Config.placeholder_images.CATEGORY
            }, this.model.toJSON());

            if (data.category) {
                data.categoryName = data.category.name || null;

                if (data.category.icon && data.category.icon.url) {
                    data.categoryIconUrl = data.category.icon.url;
                }
            }

            if (!data.categoryIconUrl || data.categoryIconUrl.indexOf("{") !== -1) {
                data.categoryIconUrl = Config.placeholder_images.CATEGORY;
            }

            return data;
        }
    });

    return VenueListItem;
});
