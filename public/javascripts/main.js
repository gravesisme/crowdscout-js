/*global require, requirejs */
(function() {
    'use strict';

    requirejs.config({
        paths: {
            "text": "/bower_components/requirejs-plugins/lib/text",
            "json": "/bower_components/requirejs-plugins/src/json",
            "jquery": "/bower_components/jquery/dist/jquery",
            "bootstrap": "/bower_components/bootstrap/dist/js/bootstrap",
            "backbone": "/bower_components/backbone/backbone",
            "underscore": "/bower_components/underscore/underscore",
            "hammerjs": "/bower_components/hammerjs/hammer",
            "moment": "/bower_components/moment/moment",
            "modernizr": "/bower_components/modernizr/modernizr",
            "slick-carousel": "/bower_components/slick-carousel/slick/slick",
            "fastclick": "/bower_components/fastclick/lib/fastclick",
            "_s": "3rd-party/underscore.string",
            "backbone-fetch-cache": "3rd-party/backbone.fetch-cache",
            "marionette": "3rd-party/backbone.marionette",
            "jquery-hammer": "3rd-party/jquery.hammer",
            "Promise": "3rd-party/promise",
            "config": "config",
            "utils": "utils/Utils",
            "PubSub": "utils/PubSub"
        },
        map: {
            "*": {
                "Utils": "utils",
                "Config": "config",
                "_": "underscore",
                "slick": "slick-carousel",
                "momentjs": "moment"
            }
        },
        shim: {
            "_": {
                exports: "_"
            },
            "_s": {
                deps: ["_"],
                exports: "_s"
            },
            "bootstrap": ["jquery"],
            "slick": ["jquery"],
            "marionette": {
                deps: ["_", "backbone"],
                exports: "Marionette"
            },
            "backbone-fetch-cache": ["_", "backbone"],
            "jquery-hammer": ["hammerjs"]
        },

        deps: ["_", "backbone", "backbone-fetch-cache", "marionette",
            "jquery", "bootstrap", "modernizr", "fastclick", "jquery-hammer",
            "momentjs", "slick"],

        callback: function() {
            console.log("main.js: All dependencies loaded!");
        }
    });

    require(["_", "app", "config", "Utils", "bootstrapped_content", "moment", "fastclick"], function(_, App, Config, Utils, bootstrapped_content, moment, FastClick) {
        window.app = App;
        window.config = Config;
        window.utils = Utils;
        window.bootstrapped_content = bootstrapped_content;

        // Configure Marionette Inspector
        // More info: https://www.youtube.com/watch?v=jbGm3mJXh_s
        if (window.__agent) {
            window.__agent.start(Backbone, Marionette);
            window.__agent.disableAnalytics = !Utils.isLocalhost() || !Config.ENABLE_MARIONETTE_INSPECTOR_ANALYTICS;
        }

        // Configure _.template settings now that all dependencies are loaded
        _.templateSettings = {
            evaluate    : /\{\[(.+?)\]\}/g,
            interpolate : /\{\{(.+?)\}\}/g,
            escape      : /{{-(.+?)}}/g
        };

        // Configure moment.js
        moment.locale('en', {
            calendar : {
                lastDay : '[Yesterday at] LT',
                sameDay : '[Today at] LT',
                nextDay : '[Tomorrow at] LT',
                lastWeek : '[Last] dddd [at] LT',
                nextWeek : 'dddd [at] LT',
                sameElse : 'MMMM DD [at] LT'
            }
        });

        // Start the application
        app.start();

        $(document.body).hammer();

        new FastClick(document.body);
    });
})();
