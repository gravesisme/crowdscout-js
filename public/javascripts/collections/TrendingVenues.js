/**
 * Created by dgraves on 3/18/15.
 */
define(["Config", "collections/Venues"], function(Config, VenuesCollection) {

    var TrendingVenuesCollection = VenuesCollection.extend({
        url: function() {
            return Config.routes.getTrendingVenuesNearAddress(this.getAddress());
        }
    });

    return TrendingVenuesCollection;
});
