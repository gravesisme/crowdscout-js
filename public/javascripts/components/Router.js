/**
 * Created by dgraves on 3/5/15.
 */
define(["marionette", "json!data/routes.json"], function(Marionette, Routes) {
    var AppRouter = Marionette.AppRouter.extend({
        appRoutes: _.extend({}, Routes.web)
    });

    return AppRouter;
});
