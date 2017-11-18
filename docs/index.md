# Global




**Members:**

+ clonedRespForCache
+ clonedReqForCache
+ clonedRespForCache
+ abort
+ cachedInstance
+ abort
+ cachedInstance

* * *

### merge(standard, user) 

Helper to merge configs

**Parameters**

**standard**: `Config`, Helper to merge configs

**user**: `Config`, Helper to merge configs

**Returns**: `Config`


### bin2String(array) 

Converts a byte array to a string

**Parameters**

**array**: `number`, Converts a byte array to a string

**Returns**: `*`


### md5HashBody(blob) 

Hashes a file given its blob

**Parameters**

**blob**: `Blob`, Hashes a file given its blob

**Returns**: `Promise.&lt;string&gt; | *`


### canBeCached(url) 

Checks for a given URL if it is allowed to be cached

**Parameters**

**url**: , Checks for a given URL if it is allowed to be cached

**Returns**: `Promise.&lt;boolean&gt;`


### canBeUpdated(url) 

Checks if a given URL is allowed to be updated

**Parameters**

**url**: , Checks if a given URL is allowed to be updated

**Returns**: `Promise.&lt;boolean&gt;`


### cacheResponse(request, response) 

Caches a response given the request/URL

**Parameters**

**request**: `Request | string`, Caches a response given the request/URL

**response**: `Response`, Caches a response given the request/URL



### fetchResponse(request, options) 

Fetches a request only if we may be online (since navigator.onLine is funky)

**Parameters**

**request**: `Request | string`, Fetches a request only if we may be online (since navigator.onLine is funky)

**options**: `Object`, Fetches a request only if we may be online (since navigator.onLine is funky)

**Returns**: `Promise.&lt;Response&gt; | null`


### &quot;cacheFirst&quot;(event) 

Provide cache and if not present provide fetch.
Does not update automatically

**Parameters**

**event**: `Event`, Provide cache and if not present provide fetch.
Does not update automatically

**Returns**: `Promise.&lt;Response&gt; | *`


### &quot;networkFirst&quot;(event) 

Network first strategy.
Since it fetches first-thing it won't need to update

**Parameters**

**event**: , Network first strategy.
Since it fetches first-thing it won't need to update

**Returns**: `Promise.&lt;Response&gt; | *`


### &quot;staleWhileRevalidate&quot;(event) 

Stale while revalidate strategy.
Serve a, potentially, outdated file but then check for updates with a fallback to network

**Parameters**

**event**: , Stale while revalidate strategy.
Serve a, potentially, outdated file but then check for updates with a fallback to network

**Returns**: `Promise.&lt;Response&gt; | *`


### &quot;requestFileUpdate&quot;(url) 

Requests a file from the internet and checks if the cached config.VERSION is different

**Parameters**

**url**: `string`, Requests a file from the internet and checks if the cached config.VERSION is different



### &quot;requestServerHash&quot;(url) 

Requests the hash of a specific file from a specified URL via POST

**Parameters**

**url**: , Requests the hash of a specific file from a specified URL via POST



### installEvent(event) 

Responds to an install event received.
Since install happens after page load, it is important not to be asyncroneous.

**Parameters**

**event**: , Responds to an install event received.
Since install happens after page load, it is important not to be asyncroneous.



### activateEvent(event) 

This is called every time the page is loaded. Therefore, we want to keep it lightweight

**Parameters**

**event**: , This is called every time the page is loaded. Therefore, we want to keep it lightweight



### checkUpdate() 

Checks for updates



### fetchEvent(event) 

Responds to a fetch event received

**Parameters**

**event**: , Responds to a fetch event received




* * *










