/**
 * Created by dgraves on 3/18/15.
 */
//define(["backbone", "config", "Utils", "views/BrowseVenuesPage", "models/BrowseVenuesPageModel", "collections/TrendingVenues"], function(Backbone, Config, Utils, BrowseVenuesPage, BrowseVenuesPageModel, TrendingVenuesCollection) {
define(["backbone", "config", "Utils"], function(Backbone, Config, Utils) {
    "use strict";

    var PageModel = Backbone.Model.extend({
        defaults: {
            title: "CrowdScout",
            address: Config.DEFAULT_ADDRESS,
            section: Config.DEFAULT_SECTION
            //pageViewClass: BrowseVenuesPage
            //pageModel: BrowseVenuesPageModel,
            //pageCollection: TrendingVenuesCollection,
            //pageViewOptions: {}
        }
    });

    return PageModel;
});
