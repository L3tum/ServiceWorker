/**
 * Created by Tom on 13.11.2017.
 */

/**
 * Configuration of the Service Worker.
 * You can register callbacks in their respective dictionaries, or
 * register them via postMessage.
 * You can add methods to the service worker via the METHODS object or via postMessage.
 *
 * The ServiceWorker contains a default configuration that is applicable for most simple websites.
 * For details on that look at the respective fields.
 * Generally simple fields will be replaced, while some objects/arrays will be merged.
 * @class
 *
 * @example <caption>Example of registering callback via postmessage</caption>
 * mySw.postMessage({
 *  type: 2 <number>,
 *  name: function name <string>,
 *  method: an actual function stringified <function>
 * })
 *
 * @example <caption>Example of changing config value via postmessage</caption>
 * mySw.postMessage({
 *  type: 3 <number>,
 *  field: field name <string>,
 *  value: field value <anything>
 * })
 */
class Config {
    constructor() {
        /**
         * VERSION. Change this if you want to do a force reload
         * @type {string}
         */
        this.VERSION = "1.0.0";

        /**
         * Enables debug logs
         * @type {boolean}
         */
        this.developer = true;

        /**
         * The cache name.
         * Not really important, so it uses your website adress as default
         * but you can set it to anything
         * @type {string}
         */
        this.CACHE_NAME = location.hostname + "-v";

        /**
         * These specify the URLs to cache (whitelist).
         * It will replace the default configuration.
         * The Strings will be converted into regular expressions in order to
         * simplify the configuration.
         * @type {string[]}
         *
         * @example ".*" will be RegExp(".*", "gi")
         */
        this.URLS_TO_CACHE_WHITELIST = [
            ".*"
        ];

        /**
         * These URLs won't be cached at all. You'll most likely want videos in there,
         * since they can take up your cache space pretty quickly.
         * It will be merged with the default configuration.
         * The Strings will be converted into regular expressions in order to simplify the configuration.
         * @type {string[]}
         *
         * @example ".*" will be RegExp(".*", "gi")
         */
        this.URLS_TO_CACHE_BLACKLIST = [];

        /**
         * URLs to precache. Accepted are only fully qualified Strings of relative or absolute URLs
         * It will replace the default configuration.
         * @type {string[]}
         */
        this.PRE_CACHE = [];

        /**
         * Whitelist for all files that should be updated.
         * Accepted are either relative or absolute URLs or any part of any URL, like certain CDNs or so.
         * Generally best practice is to allow all and then blacklist the ones you don't want.
         * Will replace the default configuration.
         * The Strings will be converted into regular expressions.
         * @type {string[]}
         *
         * @example ".*" will be RegExp(".*", "gi")
         */
        this.UPDATE_WHITELIST = [
            ".*"
        ];

        /**
         * Blacklist for all files that should not be updated.
         * Accepted are either relative or absolute URLs or any part of any URL, like certain CDNs or so.
         * Generally best practice (IMO) would be to exclude all files that have a fixed config.VERSION,
         * like jQuery and Bootstrap.
         * This also saves a lot of overhead since these files are generally pretty big and take a lot of time to process.
         * Will merge with the default configuration.
         * The Strings will be converted into regular expressions.
         * @type {string[]}
         *
         * @example ".*" will be RegExp(".*", "gi")
         */
        this.UPDATE_BLACKLIST = [];

        /**
         * Strategy for the sw to use. Available are:
         * 0: Network First,
         * 1: Cache first,
         * 2: Stale while revalidate
         *
         * While there may be more I don't really see the benefit of adding them.
         * Cache only is basically cache first without checking for network connectivity.
         * Network only is, in my opinion, the worst thing to do, since you don't necessarily need a SW for that.
         * And nobody can tell me you update something that often and it's that important.
         *
         * If you want to add your own you can specify a callback in $STRATEGY_CALLBACKS anyways,
         * or register it via postMessage
         * @type {number}
         */
        this.STRATEGY = 2;

        /**
         * Strategy callbacks which are called when a fetch event is fired.
         * They accept an Event and return a Promise<Response>.
         * The methods need to be registered in either METHODS or via postmessage.
         * @type {Object}
         * @example
         * async function(event){return fetch(event.request);}
         */
        this.STRATEGY_CALLBACKS = {
            0: "networkFirst",
            1: "cacheFirst",
            2: "staleWhileRevalidate"
        };

        /**
         * These are fetch hooks called when a fetch event was fired.
         * They accept an Event and return an Event to be used further by the STRATEGY_CALLBACKS.
         * The methods need to be registered in either METHODS or via postmessage.
         * @type {{string:function}}
         * @example
         * async function(event){return new FetchEvent();}
         */
        this.FETCH_CALLBACKS = {};

        /**
         * Update strategy to use with stale while revalidate
         *
         * Available are:
         *
         * 0: No strategy
         * 1: Request each file when it was retrieved from cache without slowing down response time
         * 2: Server-request which uses POST: {url:string} to request the server to return a md5 hash of the file like {hash:string}
         * @type {number}
         */
        this.UPDATE_STRATEGY = 1;

        /**
         * These are the update callbacks which will be called depending on UPDATE_STRATEGY.
         * You can add to them directly or register a callback via postMessage.
         * The methods need to be registered in either METHODS or via postmessage.
         * @type {Object}
         * @example
         * async function(url){}
         */
        this.UPDATE_CALLBACKS = {
            0: null,
            1: "requestFileUpdate",
            2: "requestServerHash"
        };

        /**
         * The Server Adress used for 'requestServerHash'. Specify a valid relative or absolute URL
         * which will accept an URL in POST and return a Hash.
         * @type {string}
         */
        this.HASH_ADDRESS = "/gethash";

        /**
         * Enum for the different message types used for reporting
         * @type {Object}
         */
        this.MESSAGE_TYPES = {
            0: "receivedUpdate",
            1: "receivedConfigUpdate",
            2: "methodToRegister",
            3: "fieldToChange"
        };

        /**
         * This will store the method names
         * @type {Object}
         * @example
         * "function(){}"
         */
        this.METHODS = {};
    }
}

module.exports = Config;

