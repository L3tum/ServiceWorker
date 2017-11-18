# Global





* * *

## Class: Config



## Class: Config


**VERSION**: `string` , VERSION. Change this if you want to do a force reload
**developer**: `boolean` , Enables debug logs
**CACHE_NAME**: `string` , The cache name.
**URLS_TO_CACHE_WHITELIST**: `Array.&lt;string&gt;` , These specify the URLs to cache (whitelist)
**URLS_TO_CACHE_BLACKLIST**: `Array.&lt;string&gt;` , These URLs won't be cached at all. You'll most likely want videos in there,
**PRE_CACHE**:  , URLs to precache. Accepted are only fully qualified Strings of relative or absolute URLs
**UPDATE_WHITELIST**: `Array.&lt;string&gt;` , Whitelist for all files that should be updated. Can contain RegExp or String.
**UPDATE_BLACKLIST**: `Array.&lt;string&gt;` , Blacklist for all files that should not be updated. Can contain RegExp or String.
**STRATEGY**: `number` , Strategy for the sw to use. Available are:
**STRATEGY_CALLBACKS**: `Object` , Strategy callbacks by type.
**FETCH_CALLBACKS**: `Object` , You can dynamically register callbacks by calling
**UPDATE_STRATEGY**: `number` , Update strategy to use with stale while revalidate
**UPDATE_CALLBACKS**:  , This is the dictionary for the different strategies.
**MESSAGE_TYPES**: `Object` , Enum for the different message types used for reporting


* * *









