/**
 * Created by dgraves on 3/18/15.
 */
define(["backbone", "config", "Utils"], function(Backbone, Config, Utils) {
        var BrowseVenuesPageModel = Backbone.Model.extend({
            defaults: {
                address: Config.DEFAULT_ADDRESS,
                section: Config.DEFAULT_SECTION
            }
        });

        return BrowseVenuesPageModel;
});
