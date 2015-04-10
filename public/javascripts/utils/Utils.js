/**
 * Created by dgraves on 12/4/14.
 */
define(["_s"], function(_s) {
    var ArrayProto = Array.prototype;

    function _s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    var Utils = {

        _s: function(command, str, extras) {
            var args = ArrayProto.slice.call(arguments, 0),
                cmd = args[0];

            var result = _s[cmd].apply(null, args.slice(1));
            return (result instanceof _s ? result.value() : result);
        },

        parseFetchResponse: function(response) {
            if (_.isObject(response) && response.hasOwnProperty("code") && response.hasOwnProperty("status") && response.hasOwnProperty("data")) {
                return response.data;
            }
            return response;
        },

        /**
         *
         * @param coordinate {Number}
         * @returns {Number}
         */
        formatCoordinate: function(coordinate) {
            if (typeof coordinate !== "number") return coordinate;
            if (Math.floor(coordinate) === coordinate) return coordinate;
            return parseFloat(coordinate.toPrecision(8));
        },

        formatLatLng: function(lat, lng) {
            return {
                lat: Utils.formatCoordinate(lat),
                lng: Utils.formatCoordinate(lng)
            };
        },

        capitalize: function(str) {
            /*
            if (str.length <= 1) return str.toUpperCase();
            return str.charAt(0).toUpperCase() + str.substring(1);
            */
            return _s(str).capitalize().value();
        },

        // humanizeAddress("boston,ma,united+states+of+america") => "Boston, MA, United States Of America"
        humanizeAddress: function(address) {
            if (typeof address !== "string") return address;

            return address.toLowerCase().trim().replace(/[\+\-]/g, " ")
                .split(",").map(function(s) {
                    s = s.trim();
                    if (s.length <= 2) return s.toUpperCase();
                    return Utils.capitalize(s);
                }).join(", ")
                .split(" ").map(Utils.capitalize).join(" ");
        },

        slugify: function(s) {
            if (typeof s !== "string") return s;
            var str = s.split(",").map(_s.slugify).join(",");
            //var str = s.split(",").map(_s.slugify).join(",").replace(/\-/g, "+");
            /*
            var str = s.split(",").map(function(substr) {
                return substr.split(" ").map(_s.slugify).join("+")
            }).join(",");
            */
            return str;
        },

        /**
         * Used to normalize a string meant to be passed as a query parameter
         *
         * Converts something like 'Las Vegas, NV' into 'las+vegas,nv'
         *
         * @param s {@link String} The string that should be normalized
         * @return {@link String} Lowercase string with all whitespace replaced with '+'
         */
        normalizeQueryParam: function(s) {
            if (typeof s !== "string") return "";
            //return s.trim().toLowerCase().replace(/,[\s]/g, ",").replace(/[\s]/g, "+");
            return s.trim().toLowerCase().replace(/,[\s]+/g, ",").replace(/[\s]+/g, "+");
        },

        formatUrl: function(url, options) {
            options || (options = {});

            // Convert options hash to query params
            var queryParams = $.param(options);

            // Determine if any query params need to be added to the url
            if (queryParams.length > 0) {
                url += "?" + queryParams;
            }

            var formattedUrl = Utils.normalizeQueryParam(url);

            return formattedUrl;
        },

        isMobile: function() {
            var userAgent = navigator.userAgent || navigator.vendor || window.opera;
            return ((/iPhone|iPod|iPad|Android|BlackBerry|Opera Mini|IEMobile/).test(userAgent));
        },

        isLocalhost: function() {
            return (window.location.href.indexOf("localhost") !== -1);
        },

        /**
         * Used to determine if a specified time is within X mins of the current time
         *
         * @param time
         * @param mins
         * @returns {boolean}
         */
        isWithinTimeframe: function(time, mins) {
            var currTime = +new Date();
            return((((currTime - time)/1000) <= (60*mins)));
        },

        /**
         * Decodes a hex string to ASCII format
         *
         * @param string
         * @return {String}
         */
        decodeEscapeSequence: _.memoize(function(string) {
            return string ? string.replace(/&#x([0-9A-Fa-f]{2});/g, function() {
                return String.fromCharCode(parseInt(arguments[1], 16));
            }) : "";
        }),

        /**
         * Calls decodeEscapeSequence for all strings in an object
         *
         * @param obj
         * @returns {*}
         */
        decode: function(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (_.isString(obj[prop])) {
                        obj[prop] = _utils.decodeEscapeSequence(obj[prop]);
                    } else if (_.isObject(obj[prop])) {
                        _utils.decode(obj[prop]);
                    }
                }
            }
            return obj;
        },

        /**
         * Filters an object similar to Array.filter. If an Array is provided, Array.prototype.filter is used.
         *
         * @param obj
         * @param validator (Default: Filters out null/undefined values)
         * @returns {*}
         */
        filter: function(obj, validator) {
            // Use the default validator if one was not provided
            validator = validator || _defaultValidator;

            // Use native filtering for Arrays
            if(Array.isArray(obj)) return(ArrayProto.filter.call(obj.slice(0), validator));

            // If it's not an array and not an object, return immediately
            if(typeof obj !== "object") return obj;

            var keys = Object.keys(obj), validatedObj = {};
            keys.forEach(function(key) {
                var val = obj[key];
                // Handle nested objects/arrays
                if(Array.isArray(val) || (typeof val === "object" && val !== null)) {
                    validatedObj[key] = Utils.filter(val, validator);
                } else {
                    // If the current key is valid, add it to the new validated object
                    validator(val) && (validatedObj[key] = val);
                }
            });

            // Return object free of null/undefined values
            return validatedObj;
        },

        /**
         *
         * @param str {Number|String}   The number - or string - that should be padded
         * @param len {Number = 2}      The desired length of the string
         * @param pad {String = "0"}    The type of padding character to use
         * @return {String}
         */
        pad: function(str, len, pad) {
            var result = typeof str === "number" ? (new String(str)).toString() : str;
            if(typeof result === "string") {
                len = len || 2;
                pad = typeof pad === "undefined" ? "0" : (typeof pad === "string" ? pad : (new String(pad)).toString());
                for(var i = result.length; i < len; i++) {
                    result = pad + result;
                }
            }
            return(result);
        },

        getRandomNum: function(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        },

        UUID: function() {
            return _s4() + _s4() + '-' + _s4() + '-' + _s4() + '-' +
                _s4() + '-' + _s4() + _s4() + _s4();
        }
    };

    return Utils;
});
