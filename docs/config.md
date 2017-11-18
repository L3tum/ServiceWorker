# Global





* * *

## Class: Config



## Class: Config


**VERSION**: `string` , VERSION. Change this if you want to do a force reload
**developer**: `boolean` , Enables debug logs
**CACHE_NAME**: `string` , The cache name.Not really important, so it uses your website adress as defaultbut you can set it to anything
**URLS_TO_CACHE_WHITELIST**: `Array.&lt;string&gt;` , These specify the URLs to cache (whitelist)
**URLS_TO_CACHE_BLACKLIST**: `Array.&lt;string&gt;` , These URLs won't be cached at all. You'll most likely want videos in there,since they can take up your cache space pretty quickly.Accepted are either Strings or RegExp and can contain any part of the URL or even the full URL.
**PRE_CACHE**:  , URLs to precache. Accepted are only fully qualified Strings of relative or absolute URLs
**UPDATE_WHITELIST**: `Array.&lt;string&gt;` , Whitelist for all files that should be updated. Can contain RegExp or String.Accepted are either relative or absolute URLs or any part of any URL, like certain CDNs or so.Generally best practice is to allow all and then blacklist the ones you don't want
**UPDATE_BLACKLIST**: `Array.&lt;string&gt;` , Blacklist for all files that should not be updated. Can contain RegExp or String.Accepted are either relative or absolute URLs or any part of any URL, like certain CDNs or so.Generally best practice (IMO) would be to exclude all files that have a fixed config.VERSION,like jQuery and Bootstrap.This also saves a lot of overheadsince these files are generally pretty big and take a lot of time to process.
**STRATEGY**: `number` , Strategy for the sw to use. Available are:0: Network First,1: Cache first,2: Stale while revalidateWhile there may be more I don't really see the benefit of adding them.Cache only is basically cache first without checking for network connectivity.Network only is, in my opinion, the worst thing to do.If you want to add your own you can specify a callback in $STRATEGY_CALLBACKS
**STRATEGY_CALLBACKS**: `Object` , Strategy callbacks by type.Make sure that they always return a Promise<Response>
**FETCH_CALLBACKS**: `Object` , You can dynamically register callbacks by callingsw.postmessage(method, function)Method means the method of the request and function needs to be a valid function,which returns a Promise<Event> and accepts an event.Additionally, the function needs to be JSON stringified in order to work correctly, if you register it via postmessage.You can call other strategy callbacks in your own callback as well, though beware that they return a response and not a request.This is sort of a hook more than a callback.
**UPDATE_STRATEGY**: `number` , Update strategy to use with stale while revalidateAvailable are:0: No strategy1: Request each file when it was retrieved from cache without slowing down response time2: Server-request which uses POST: {url:string} to request the server to return a md5 hash of the file like {hash:string}
**UPDATE_CALLBACKS**:  , This is the dictionary for the different strategies.You should add to it directly
**MESSAGE_TYPES**: `Object` , Enum for the different message types used for reporting


* * *










