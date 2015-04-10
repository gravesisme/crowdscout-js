/**
 * Created by dgraves on 3/16/15.
 */
define(["marionette", "PubSub", "Utils", "config", "text!partials/location_search_result_list_item.html"], function(Marionette, PubSub, Utils, Config, template) {

    var LocationSearchResultListItem = Backbone.Marionette.ItemView.extend({
        className: "searchResultListItem location flex-container",

        tagName: "li",

        template: _.template(template),

        triggers: {
            //"click": "change:location"
            "click .address": "change:location"
        },

        events: {
            //"click .address": function(e) {
            "click": function(e) {
                debugger;
                console.log("LocationSearchResultListItem.onClick(): arguments = ", arguments);

                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        },

        /*
        events: {
            "click": function(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                var address = this.model.get("address");

                if (address && address.length > 0) {
                    var url = "explore/" + Utils.normalizeQueryParam(address);
                    console.log("LocationSearchResultListItem.onClick(): url = " + url);
                    PubSub.trigger("navigate", url, true);
                }
            }
        },
        */

        serializeData: function() {
            var data = $.extend(true, {}, {
                link: "#",
                categoryIconUrl: Config.placeholder_images.CATEGORY
            }, this.model.toJSON());

            if (data.address) {
                data.link = "explore/" + Utils.normalizeQueryParam(data.address);
            } else {
                data.address = "NO RESULTS FOUND";
            }

            return data;
        }
    });

    return LocationSearchResultListItem;
});
