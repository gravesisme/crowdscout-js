/**
 * Created by dgraves on 3/13/15.
 */
define(["marionette", "config"], function(Marionette, Config) {

    /**
     * Usage:
     *
     * regions: {
     *    content: {
     *        regionClass: ContentRegion,
     *        selector: "#content",
     *        animateTransitions: true
     *    }
     *  }
     *
     */
    var ContentRegion = Backbone.Marionette.Region.extend({
        initialize: function(options) {
            var settings = _.extend({
                animateTransitions: false
            }, (options || {}));

            this.animateTransitions = settings.animateTransitions;
        },
        show: function(view, options) {
            Config.DEBUG_MODE && console.log("ContentRegion.show(): this.animateTransitions = ", this.animateTransitions, "\n\tthis.hasView() = ", this.hasView(), "\n\targuments = ", arguments);

            if (!this.animateTransitions) {
                Backbone.Marionette.Region.prototype.show.apply(this, arguments);
                return;
            }

            var _animationBindings = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
                _onAnimationTimeout, _onAnimationEnded;

            var _originalArgs = Array.prototype.slice.call(arguments, 0),
                _onReadyToShow = function() {
                    Config.DEBUG_MODE && console.log("ContentRegion.show(): _onReadyToShow triggered! originalArgs = ", _originalArgs);
                    _onAnimationTimeout = null;
                    _onAnimationEnded = null;
                    this.$el.removeClass("animated slideInLeft slideOutLeft");
                    Backbone.Marionette.Region.prototype.show.apply(this, _originalArgs);
                    this.$el.addClass("animated slideInRight");
                }.bind(this);

            if (!this.hasView()) {
                _onReadyToShow();
                return;
            }

            _onAnimationEnded = function() {
                Config.DEBUG_MODE && console.log("ContentRegion.show(): _onAnimationEnded triggered! arguments = ", arguments);
                clearTimeout(_onAnimationTimeout);
                _onReadyToShow();
            }.bind(this);

            _onAnimationTimeout = setTimeout(function() {
                Config.DEBUG_MODE && console.log("ContentRegion.show(): _onAnimationTimeout triggered! arguments = ", arguments);
                this.$el.off(_animationBindings, _onAnimationEnded);
                _onReadyToShow();
            }.bind(this), 500);

            this.$el
                .removeClass("animated slideInLeft slideOutLeft")
                .one(_animationBindings, _onAnimationEnded)
                .addClass("animated slideOutLeft");
        }
    });

    return ContentRegion;
});
