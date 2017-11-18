/**
 * Created by Tom on 01.11.2017.
 */
/**
 * @license MIT License

 Copyright (c) 2017 Tom "L3tum" Pauly

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
import md5 from "md5";
import localforage from "localforage";
import Config from "config";

/**
 * The config to use
 */
var config;

/**
 * Files queued for updating
 * @type {String[]}
 */
const updateable = [];

/**
 * Helper to merge configs
 * @param standard {Config}
 * @param user {Config}
 * @returns {Config}
 */
const merge = function (standard, user) {
    for (let idx in user) {
        if (idx === "URLS_TO_CACHE_BLACKLIST" || idx === "UPDATE_BLACKLIST") {
            standard[idx] = standard[idx].concat(user[idx]);
        } else if (idx === "METHODS") {
            for (let key in user["METHODS"]) {
                if (user["METHODS"].hasOwnProperty(key)) {
                    // eslint-disable-next-line no-new-func
                    callbacks[key] = new Function(user["METHODS"][key]);
                }
            }
        } else {
            standard[idx] = user[idx];
        }
    }
    return standard;
};

/**
 * Converts a byte array to a string
 * @param array {[]}
 * @returns {*}
 */
const bin2String = async function (array) {
    return String.fromCharCode.apply(String, array);
};

/**
 * Hashes a file given its blob
 * @param blob {Blob}
 * @returns {Promise.<string>|*}
 */
const md5HashBody = function (blob) {
    return new Promise(function (resolve, reject) {
        let arrayBuffer;
        let fileReader = new FileReader();

        fileReader.onloadend = async function () {
            arrayBuffer = this.result;
            bin2String(arrayBuffer).then(async function (result) {
                let hash = md5(result);

                resolve(hash);
            });
        };
        fileReader.readAsArrayBuffer(blob);
    });
};

/**
 * Checks for a given URL if it is allowed to be cached
 * @param url
 * @returns {Promise<boolean>}
 */
const canBeCached = async function (url) {
    let whitelisted = false;
    let blacklisted = false;

    for (let regex of config.URLS_TO_CACHE_WHITELIST) {
        if (url.match(new RegExp(regex, "gi")) !== null) {
            whitelisted = true;
            break;
        }
    }
    if (whitelisted) {
        for (let regex of config.URLS_TO_CACHE_BLACKLIST) {
            if (url.match(new RegExp(regex, "gi")) !== null) {
                blacklisted = true;
                break;
            }
        }
    }
    return whitelisted && !blacklisted;
};

/**
 * Checks if a given URL is allowed to be updated
 * @param url
 * @returns {Promise<boolean>}
 */
const canBeUpdated = async function (url) {
    let whitelisted = false;
    let blacklisted = false;

    for (let regex of config.UPDATE_WHITELIST) {
        if (url.match(new RegExp(regex, "gi")) !== null) {
            whitelisted = true;
            break;
        }
    }
    if (whitelisted) {
        for (let regex of config.UPDATE_BLACKLIST) {
            if (url.match(new RegExp(regex, "gi")) !== null) {
                blacklisted = true;
                break;
            }
        }
    }
    return whitelisted && !blacklisted;
};

/**
 * Caches a response given the request/URL
 * @param request {Request|string}
 * @param response {Response}
 */
const cacheResponse = async function (request, response) {
    let url;

    if (request.url) {
        url = request.url;
    } else {
        url = request;
    }
    if (canBeCached(url)) {
        caches.open(config.CACHE_NAME + config.VERSION).then(async function (cache) {
            cache.put(url, response);
        });
    }
};

/**
 * Fetches a request only if we may be online (since navigator.onLine is funky)
 * @param request {Request|string}
 * @param options {{}}
 * @returns {Promise<Response>|null}
 */
const fetchResponse = async function (request, options = null) {
    if (navigator.onLine) {
        if (options !== null) {
            return fetch(request, options).then(async function (response) {
                return response;
            });
        }
        return fetch(request).then(async function (response) {
            return response;
        });
    }
    return null;
};

const postMessages = async function (type, message) {
    self.postMessage({type: type, message: message});
};

const callbacks = [];

/**
 * Provide cache and if not present provide fetch.
 * Does not update automatically
 * @param event {Event}
 * @returns {Promise.<Response>|*}
 */
callbacks["cacheFirst"] = function (event) {
    return (async(event) => {
        let clonedReqForNetwork = event.request.clone();

        return caches.match(event.request.url).then(function (matched) {
            /**
             * Check if valid response from cache
             */
            if (matched !== null && matched.type !== "error") {
                return matched;
            }
            let clonedReqForCache = clonedReqForNetwork.clone();

            return fetchResponse(clonedReqForNetwork.url).then(function (networkResponse) {
                /**
                 * Check if cacheable
                 */
                if (networkResponse !== null && networkResponse !== "error") {
                    /**
                     * Cache response
                     */
                    let clonedRespForCache = networkResponse.clone();

                    cacheResponse(clonedReqForCache, clonedRespForCache);
                }
                return networkResponse;
            });
        }).catch(function () {
            /**
             * Cache did not find anything
             */

            let clonedReqForCache = clonedReqForNetwork.clone();

            return fetchResponse(clonedReqForNetwork.url).then(function (networkResponse) {
                /**
                 * Check if cacheable
                 */
                if (networkResponse !== null && networkResponse !== "error") {
                    /**
                     * Cache response
                     */
                    let clonedRespForCache = networkResponse.clone();

                    cacheResponse(clonedReqForCache, clonedRespForCache);
                }
                return networkResponse;
            });
        });
    })(event);
};

/**
 * Network first strategy.
 * Since it fetches first-thing it won't need to update
 * @param event
 * @returns {Promise.<Response>|*}
 */
callbacks["networkFirst"] = function (event) {
    return (async(event) => {
        let clonedReqForCache = event.request.clone();

        return fetchResponse(event.request.url).then(function (networkResponse) {
            if (networkResponse !== null && networkResponse.type !== "error") {
                let clonedRespForReturn = networkResponse.clone();

                cacheResponse(clonedReqForCache, networkResponse);
                return clonedRespForReturn;
            }
            return caches.match(event.request.url).then(function (matched) {
                return matched;
            });
        });
    })(event);
};

/**
 * Stale while revalidate strategy.
 * Serve a, potentially, outdated file but then check for updates with a fallback to network
 * @param event
 * @returns {Promise.<Response>|*}
 */
callbacks["staleWhileRevalidate"] = function (event) {
    return (async(event) => {
        let clonedReqForNetwork = event.request.clone();

        return caches.match(event.request.url).then(function (matched) {
            if (matched && matched.type !== "error") {
                /**
                 * Update
                 */
                updateable.push(event.request.url);
                if (checkUpdateTimeout === null) {
                    checkUpdateTimeout = setTimeout(checkUpdate, 500);
                }
                return matched;
            }
            return fetchResponse(event.request.url).then(function (networkResponse) {
                if (networkResponse !== null && networkResponse.type !== "error") {
                    let clonedForCache = networkResponse.clone();

                    cacheResponse(clonedReqForNetwork, clonedForCache);
                }
                return networkResponse;
            });
        }).catch(function () {
            return fetchResponse(event.request.url).then(function (networkResponse) {
                if (networkResponse !== null && networkResponse.type !== "error") {
                    let clonedForCache = networkResponse.clone();

                    cacheResponse(clonedReqForNetwork, clonedForCache);
                }
                return networkResponse;
            });
        });
    })(event);
};

/**
 * Requests a file from the internet and checks if the cached config.VERSION is different
 * @param url {string}
 */
callbacks["requestFileUpdate"] = function (url) {
    return (async(url) => {
        caches.match(url).then(async function (cachedInstance) {
            /**
             * Is not cached for some reason
             */
            if (!cachedInstance || cachedInstance.type === "error") {
                let abort = false;

                /**
                 * Remove from database to prevent duplicates
                 */
                localforage.removeItem(url);
                /**
                 * Fetch file to store in cache
                 */
                await fetchResponse(url).then(function (networkResponse) {
                    /**
                     * Check for valid response
                     */
                    if (networkResponse && networkResponse.type !== "error") {
                        cachedInstance = networkResponse.clone();
                        cacheResponse(url, networkResponse);
                    } else {
                        /**
                         * File is something else, just leave it
                         */
                        abort = true;
                    }
                });
                if (abort) {
                    return;
                }
            }
            localforage.getItem(url).then(function (value) {
                /**
                 * Doesn't have value yet, hash it and finished
                 */
                if (value === null) {
                    cachedInstance.blob().then(function (blob) {
                        md5HashBody(blob).then(function (hash) {
                            localforage.setItem(url, hash);
                        });
                    });
                } else {
                    /**
                     * Fetch newest file and check for updates
                     */
                    fetchResponse(url).then(function (networkResponse) {
                        /**
                         * Check if we received valid file
                         */
                        if (networkResponse && networkResponse.type !== "error") {
                            let clonedResponse = networkResponse.clone();

                            networkResponse.blob().then(function (blob) {
                                md5HashBody(blob).then(function (hash) {
                                    /**
                                     * File got updated
                                     */
                                    if (hash !== value) {
                                        cacheResponse(url, clonedResponse);
                                        localforage.setItem(url, hash);
                                        postMessages(0, {file: url});
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }).catch(async function () {
            /**
             * Cache did not find file
             */

            let cachedInstance;

            fetchResponse(url).then(function (networkResponse) {
                /**
                 * Check for valid response
                 */
                if (networkResponse && networkResponse.type !== "error") {
                    cachedInstance = networkResponse.clone();
                    cacheResponse(url, networkResponse);

                    localforage.getItem(url).then(function (value) {
                        /**
                         * Doesn't have value yet, hash it and finished
                         */
                        if (value === null) {
                            cachedInstance.blob().then(function (blob) {
                                md5HashBody(blob).then(function (hash) {
                                    localforage.setItem(url, hash);
                                });
                            });
                        } else {
                            /**
                             * Fetch newest file and check for updates
                             */
                            fetchResponse(url).then(function (networkResponse) {
                                /**
                                 * Check if we received valid file
                                 */
                                if (networkResponse && networkResponse.type !== "error") {
                                    let clonedResponse = networkResponse.clone();

                                    networkResponse.blob().then(function (blob) {
                                        md5HashBody(blob).then(function (hash) {
                                            /**
                                             * File got updated
                                             */
                                            if (hash !== value) {
                                                cacheResponse(url, clonedResponse);
                                                localforage.setItem(url, hash);
                                                postMessages(0, {file: url});
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    })(url);
};

/**
 * Requests the hash of a specific file from a specified URL via POST
 * @param url
 */
callbacks["requestServerHash"] = function (url) {
    return (async(url) => {
        caches.match(url).then(async function (cachedInstance) {
            /**
             * Is not cached for some reason
             */
            if (!cachedInstance || cachedInstance.type === "error") {
                let abort = false;

                /**
                 * Remove from database to prevent duplicates
                 */
                localforage.removeItem(url);
                /**
                 * Fetch file to store in cache
                 */
                await fetchResponse(url).then(function (networkResponse) {
                    /**
                     * Check for valid response
                     */
                    if (networkResponse && networkResponse.type !== "error") {
                        cachedInstance = networkResponse.clone();
                        cacheResponse(url, networkResponse);
                    } else {
                        /**
                         * File is something else, just leave it
                         */
                        abort = true;
                    }
                });
                if (abort) {
                    return;
                }
            }
            localforage.getItem(url).then(function (value) {
                /**
                 * Doesn't have value yet, hash it and finished
                 */
                if (value === null) {
                    cachedInstance.blob().then(function (blob) {
                        md5HashBody(blob).then(function (hash) {
                            localforage.setItem(url, hash);
                        });
                    });
                } else {
                    /**
                     * Fetch newest hash from server
                     */
                    fetchResponse(config.HASH_ADDRESS, {
                        method: "POST",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            url: url
                        })
                    }).then(async function (response) {
                        response.json().then(function (json) {
                            /**
                             * Hash is different, fetch file and update caches/database
                             */
                            if (json.hash !== value) {
                                fetchResponse(url).then(function (response) {
                                    if (response && response.type !== "error") {
                                        cacheResponse(url, response);
                                        localforage.setItem(url, json.hash);
                                        postMessages(0, {file: url});
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }).catch(async function () {
            /**
             * Cache did not find file
             */

            let cachedInstance;

            fetchResponse(url).then(function (networkResponse) {
                /**
                 * Check for valid response
                 */
                if (networkResponse && networkResponse.type !== "error") {
                    cachedInstance = networkResponse.clone();
                    cacheResponse(url, networkResponse);

                    localforage.getItem(url).then(function (value) {
                        /**
                         * Doesn't have value yet, hash it and finished
                         */
                        if (value === null) {
                            cachedInstance.blob().then(function (blob) {
                                md5HashBody(blob).then(function (hash) {
                                    localforage.setItem(url, hash);
                                });
                            });
                        } else {
                            /**
                             * Fetch newest hash from server
                             */
                            fetchResponse(url, {
                                method: "POST",
                                headers: {
                                    "Accept": "application/json",
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    url: url
                                })
                            }).then(async function (response) {
                                response.json().then(function (json) {
                                    /**
                                     * Hash is different, fetch file and update caches/database
                                     */
                                    if (json.hash !== value) {
                                        fetchResponse(url).then(function (response) {
                                            if (response && response.type !== "error") {
                                                cacheResponse(url, response);
                                                localforage.setItem(url, json.hash);
                                                postMessages(0, {file: url});
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            });
        });
    })(url);
};

/**
 * Responds to an install event received.
 * Since install happens after page load, it is important not to be asyncroneous.
 * @param event
 */
const installEvent = function (event) {
    event.waitUntil(async function () {
        /**
         * Download settings first...
         */
        await fetch("sw_config.json").then(async function (jsonConfig) {
            await jsonConfig.json().then(async function (json) {
                config = merge(new Config(), json.config);
            });
        });
        console.log("Installed Service Worker v" + config.VERSION);
        if (config.developer) {
            console.log("[ServiceWorker] Deleting Caches...");
        }
        /**
         * Delete all caches as safety measure
         */
        await caches.keys().then(async function (keys) {
            for (let i = 0; i < keys.length; i++) {
                await caches.delete(keys[i]);
            }
        }).then(async function () {
            if (config.developer) {
                console.log("[ServiceWorker] Precaching...");
            }
            for (let i = 0; i < config.PRE_CACHE.length; i++) {
                /**
                 * Add all precache files
                 */
                fetchResponse(config.PRE_CACHE[i]).then(async function (response) {
                    cacheResponse(config.PRE_CACHE[i], response);
                });
            }
        }).then(function () {
            if (config.developer) {
                console.log("[ServiceWorker] Done!");
            }
            self.skipWaiting();
        });
    }());
};

/**
 * This is called every time the page is loaded. Therefore, we want to keep it lightweight
 * @param event
 */
const activateEvent = function (event) {
    /**
     * Check for config updates
     */
    fetch("sw_config.json").then(async function (jsonConfig) {
        let clone = jsonConfig.clone();

        jsonConfig.blob().then(async function (blob) {
            md5HashBody(blob).then(async function (hash) {
                localforage.getItem("sw_config.json").then(async function (value) {
                    if (value === null) {
                        localforage.setItem("sw_config.json", hash);
                    } else if (value !== hash) {
                        if (config.developer) {
                            console.log("[ServiceWorker] Received Config Update!");
                        }
                        await clone.json().then(async function (json) {
                            config = merge(new Config(), json.config);
                        });
                        localforage.setItem("sw_config.json", hash);
                        /**
                         * Delete all caches as safety measure
                         */
                        await caches.keys().then(async function (keys) {
                            for (let i = 0; i < keys.length; i++) {
                                await caches.delete(keys[i]);
                            }
                        }).then(async function () {
                            if (config.developer) {
                                console.log("[ServiceWorker] Precaching...");
                            }
                            for (let i = 0; i < config.PRE_CACHE.length; i++) {
                                /**
                                 * Add all precache files
                                 */
                                fetchResponse(config.PRE_CACHE[i]).then(async function (response) {
                                    cacheResponse(config.PRE_CACHE[i], response);
                                });
                            }
                        }).then(function () {
                            if (config.developer) {
                                console.log("[ServiceWorker] Done!");
                            }
                            postMessages(1, {});
                        });
                    }
                });
            });
        });
    });
    console.log("[ServiceWorker] Active and Ready!");
};

let checkUpdateTimeout = null;
/**
 * Whether it is currently updating. There may sometimes be multiple times this function is called,
 * so this should prevent weird behaviour
 * @type {boolean}
 */
let isUpdating = false;

/**
 * Checks for updates
 */
const checkUpdate = async function () {
    if (config.UPDATE_STRATEGY !== 0) {
        if (!isUpdating) {
            isUpdating = true;
            if (updateable.length > 0) {
                let url = updateable[0];

                updateable.splice(0, 1);
                canBeUpdated(url).then(async function (result) {
                    if (result) {
                        callbacks[config.UPDATE_CALLBACKS[config.UPDATE_STRATEGY]](url);
                    }
                });
            }
            isUpdating = false;
        }
    }
    checkUpdateTimeout = setTimeout(checkUpdate, 500);
};

/**
 * Responds to a fetch event received
 * @param event
 */
const fetchEvent = function (event) {
    /**
     * Delay update interval by 500ms to handle request
     */
    if (checkUpdateTimeout !== null) {
        clearTimeout(checkUpdateTimeout);
        checkUpdateTimeout = setTimeout(checkUpdate, 500);
    }
    event.respondWith(async function () {
        // eslint-disable-next-line no-debugger
        if (config.FETCH_CALLBACKS.length > 0 && config.FETCH_CALLBACKS[event.request.method]) {
            return callbacks[config.FETCH_CALLBACKS[event.request.method]](event).then(async function (newEvent) {
                return callbacks[config.STRATEGY_CALLBACKS[config.STRATEGY]](newEvent).then(async function (response) {
                    return response;
                });
            });
        }
        return callbacks[config.STRATEGY_CALLBACKS[config.STRATEGY]](event);
    }());
};

self.addEventListener("install", installEvent);

self.addEventListener("fetch", fetchEvent);

self.addEventListener("activate", activateEvent);

self.onmessage = async function (message) {
    let data = message.data;

    if (data.type === 2) {
        // eslint-disable-next-line no-new-func
        let functions = new Function(data.method);

        callbacks[data.name] = functions;
        if (data.callback === "STRATEGY") {
            config.STRATEGY_CALLBACKS[Object.keys(config.STRATEGY_CALLBACKS).length] = data.name;
        } else if (data.callback === "FETCH") {
            config.FETCH_CALLBACKS[data.fetchMethod] = data.name;
        } else if (data.callback === "UPDATE") {
            config.UPDATE_CALLBACKS[Object.keys(config.UPDATE_CALLBACKS).length] = data.name;
        }
    } else if (data.type === 3) {
        config[data.field] = data.value;
    }
};
