self.importScripts("sw_config.js");


/**
 * @type {String[]}
 */
const updateable = [];
/**
 * @type {boolean}
 */
let isUpdating = false;
/**
 * @type window.Worker
 */
let updateWorker;
/**
 * @type {string}
 */
let script = "";

const installEvent = function (event) {
    console.log("Installed Service Worker v" + VERSION);
    if (developer) {
        console.log("[ServiceWorker] Deleting Caches");
    }
    /**
     * Delete all caches as safety measure
     */
    caches.keys().then(function (keys) {
        for (let i = 0; i < keys.length; i++) {
            caches.delete(keys[i]);
        }
    });
    /**
     * Open defined caches
     */
    for (let i = 0; i < CACHE_NAMES.length; i++) {
        caches.open(CACHE_NAMES[i] + VERSION).then(function (cache) {
            if (developer) {
                console.log("[ServiceWorker] Opened " + CACHE_NAMES[i] + VERSION);
            }
            /**
             * Precache defined URLs
             */
            if (preCache.length > 0) {
                if (preCache[CACHE_NAMES[i]]) {
                    return cache.addAll(preCache[CACHE_NAMES[i]]);
                }
            }
            return true;
        });
    }
    updateWorker = new Worker(script);
    updateWorker.onmessage = onWorkerMessage;
};

const fetchEvent = function (event) {
    event.respondWith(
    caches.match(event.request, {ignoreSearch: true}).then(function (cachedResponse) {
        if (cachedResponse && cachedResponse.type !== "error") {
            updateable.push(event.request.url);
            return cachedResponse;
        }
        fetch(event.request.url).then(function (networkResponse) {
            if (networkResponse && cachedResponse.type !== "error") {
                updateable.push(event.request.url);
                for (let i = 0; i < urlsToCache.length; i++) {
                    for (let j = 0; j < urlsToCache[i].length; j++) {
                        if (event.request.url.match(urlsToCache[i])) {
                            caches.open(urlsToCache[i]).then(function (cache) {
                                cache.put(event.request, networkResponse);
                            });
                        }
                        /**
                         * URL is served with a router something.com/something instead of something.com/something.html
                         */
                        else if (!event.request.url.endsWith("/") &&
                        event.request.url.match(/^[\w\d\:\/\.]+\.\w{2,4}(\?[\w\W]*)?$/)) {
                            caches.open(CACHE_NAMES[1]).then(function (cache) {
                                cache.put(event.request, networkResponse);
                            });
                        }
                        else {
                            /**
                             * Fallback cache
                             */
                            caches.open(CACHE_NAMES[0]).then(function (cache) {
                                cache.put(event.request, networkResponse);
                            });
                        }
                    }
                }
            }
            return networkResponse.clone();
        });
        return null;
    }));
};

const checkForUpdates = function () {
    if (!isUpdating) {
        if (updateable.length > 0) {
            updateWorker.postMessage(updateable);
            isUpdating = true;
        }
    }
};

const onWorkerMessage = function (message) {
    isUpdating = false;
    /**
     * @type {Number[]}
     */
    let keysToSlice = [];

    for (let key in updateable) {
        if (message.data.hashes.length > key) {
            localforage.setItem(updateable[key], message.data.hashes[key]);
            keysToSlice.push(key);
        }
    }
    for (let key in keysToSlice) {
        updateable.splice(key, 1);
    }
};

self.addEventListener("install", installEvent);

self.addEventListener("fetch", fetchEvent);
