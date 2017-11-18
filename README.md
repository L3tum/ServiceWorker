# ServiceWorker
JavaScript Service Worker Implementation and Research

The Implementation will be completely plugin-and-ready once it's done.

* * *

## Research

So I was testing some stuff out regarding caching and wondered if it'd be faster to split the cache, and if yes, to do a manual lookup before matching in cache.

#### 1. Question: 

Would it be faster to store the names of all caches in an array and whenever you try to get something from the cache, 
first look through this array to see which cache to look in? 

So I wrote a little benchmark and surprise, cachestorage is way faster than the array lookup beforehand.
Maybe it would be faster to store the exact URLs in the lookup array, but then you would just recreate the cachestorage....

Anyways, here's the benchmark for anyone wanting to look into it: [Benchmark](https://jsperf.com/array-or-cachestorage/1)

#### 2. Question

Is using multiple, dedicated caches at all beneficial aside from for development when you have to clear the JS-Cache multiple times?

I wrote, again, a little benchmark. Since what we wanted to test there is the actual speed I included the setup of the caches in the actual test. 
Unfortunately given the nature of these tests I had to add some await keywords. 

Overall, what might be already obvious, but I was curious if CacheStorage `caches` had any type of advanced lookup mechanism, is that using just one giant cache is the best solution, both in read and write it seems. 

[Here](https://jsperf.com/use-separate-caches/1) is the benchmark.

***

###### &copy; Tom "L3tum" Pauly