/**
 * Created by Tom on 01.11.2017.
 */

/**
 * Version. Change this if you want to do a force reload
 * @type {string}
 */
const VERSION = "1.0.0";

/**
 * Enables debug logs
 * @type {boolean}
 */
const developer = true;

/**
 * The caches
 * The first cache will always be the fallback cache if something isn't mapped anywhere
 * The second cache will always be used for the actual pages. This is determined by checking for file endings
 * @type {string[]}
 */
const CACHE_NAMES = [
    "general-cache-v",
    "pages-cache-v",
    "css-cache-v",
    "js-cache-v",
    "img-cache-v",
    "video-cache-v"
];

/**
 * These specify the URLs mapped to each Cache
 * @type {String, [String]}
 * @type {String, [RegExp]}
 */
const urlsToCache = {
    "general-cache-v": [],
    "pages-cache-v": [
        /\.html/gi,
        /\.phtml/gi,
        /\.php/gi,
        /[a-z0-9]$/gi
    ],
    "css-cache-v": [
        /\.css/gi
    ],
    "js-cache-v": [
        /\.js/gi,
        /\.ts/gi,
        /\.jsx/gi
    ],
    "img-cache-v": [
        /\.png/gi,
        /\.jpg/gi,
        /\.webp/gi,
        /\.gif/gi
    ],
    "video-cache-v": [
        /\.ts/gi,
        /\.mp4/gi,
        /\.m3u8/gi,
        /\.m4s/gi,
        /\.mpd/gi
    ]
};

/**
 * These URLs won't be cached at all. You'll most likely want videos in there,
 * since they can take up your cache space pretty quickly.
 * Accepted are either Strings or RegExp and can contain any part of the URL or even the full URL.
 * @type {String[]}
 * @type {RegExp[]}
 */
const urlsToCacheBlacklist = [];

/**
 * URLs to precache. Accepted are only fully qualified Strings of relative or absolute URLs
 */
const preCache = {};

/**
 * Whitelist for all files that should be updated. Can contain RegExp or String.
 * Accepted are either relative or absolute URLs or any part of any URL, like certain CDNs or so.
 * Generally best practice is to allow all and then blacklist the ones you don't want
 * @type {String[]}
 * @type {RegExp[]}
 */
const updateWhitelist = [
    /.*/gi
];

/**
 * Blacklist for all files that should not be updated. Can contain RegExp or String.
 * Accepted are either relative or absolute URLs or any part of any URL, like certain CDNs or so.
 * Generally best practice (IMO) would be to exclude all files that have a fixed version, like jQuery and Bootstrap.
 * This also saves a lot of overhead since these files are generally pretty big and take a lot of time to process.
 * @type {String[]}
 * @type {RegExp[]}
 */
const updateBlacklist = [];