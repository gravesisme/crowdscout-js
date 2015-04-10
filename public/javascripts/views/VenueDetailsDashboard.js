/**
 * Created by dgraves on 3/11/15.
 */
define(["marionette", "PubSub", "Config", "text!partials/venue_details_dashboard.html"], function(Marionette, PubSub, Config, template) {

    // TODO: Move this to Config
    // Default filters to show
    var DEFAULT_VENUE_FILTERS = [{
        searchType: "recent-media",
        link: "#recent_media",
        title: "Recent Media",
        active: true
    }, {
        searchType: "recent-tweets",
        link: "#recent_tweets",
        title: "Recent Tweets",
        active: false
    }, {
        searchType: "nearby-media",
        link: "#nearby_media",
        title: "Nearby Media",
        active: false
    }, {
        searchType: "nearby-tweets",
        link: "#nearby_tweets",
        title: "Nearby Tweets",
        active: false
    }];

    function _getSearchTypeLabel(searchType) {
        var item = _.findWhere(DEFAULT_VENUE_FILTERS, { "searchType": searchType });

        if (!item) {
            item = DEFAULT_VENUE_FILTERS[0];
        }

        return item.title;
    }

    var DashboardView = Backbone.Marionette.ItemView.extend({
        className: "dashboard",

        template: _.template(template),

        ui: {
            $searchFilters: ".searchFilters",
            $recentTweetsFilter: ".filter[data-search-type='recent-tweets']"
        },

        events: {
            'click .searchFilters > .list-group-item': 'onSearchFilterClicked'
        },

        modelEvents: {
            "change": "render"
        },

        initialize: function(options) {
            options || (option = {});
        },

        onRender: function() {
            var searchType = this.model.get("searchType");

            this.ui.$searchFilters.find(".list-group-item").each(function() {
                var currSearchType = $(this).data("search-type");
                $(this).toggleClass("active", currSearchType === searchType);
            });
        },

        serializeData: function() {
            var data = $.extend(true, {}, {
                categoryName: null,
                categoryIconUrl: Config.placeholder_images.CATEGORY,
                hereNowCount: 0,
                searchType: "recent-media",
                enableRecentTweets: false,
                contact: null
            }, (this.model ? this.model.toJSON() : {}));

            if (data.category) {
                data.categoryName = data.category.name || null;

                if (data.category.icon && data.category.icon.url) {
                    data.categoryIconUrl = data.category.icon.url;
                }
            }

            if (!data.categoryIconUrl || data.categoryIconUrl.indexOf("{") !== -1) {
                data.categoryIconUrl = Config.placeholder_images.CATEGORY;
            }

            if (data.contact && data.contact.twitter && data.contact.twitter.length > 0) {
                data.enableRecentTweets = true;
            }

            data.title = _getSearchTypeLabel(data.searchType);

            Config.DEBUG_MODE && console.log("VenueDetailsDashboard.serializeData(): data.enableRecentTweets = " + data.enableRecentTweets + "\tdata = ", data);

            return data;
        },

        hideVenueFilters: function() {
            this.model.set("disableVenueFilters", true);
            this.ui.$searchFilters.find(".venue-filter").each(function() {
                $(this).addClass("disabled hidden");
            });
        },

        onSearchFilterClicked: function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            var $el = !e ? null : $(e.target);

            if (!$el || $el.hasClass("disabled")) return;

            var searchType = $el.data("search-type");

            Config.DEBUG_MODE && console.log("VenueDetailsDashboard.onSearchFilterClicked(): searchType = " + searchType);

            this.model.set("searchType", searchType);
        }
    });

    return DashboardView;
});
