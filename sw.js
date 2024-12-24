/* jshint worker: true */
/* globals caches, self*/

async function addResourcesToCache(r) {
  const cache = await caches.open("v1"); 
  const resources = r || await fetch("/resources.json");
  const json = await resources.json();
  await cache.addAll(json);
}

async function cacheFirst(request) {
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
	console.log("Cached!");
    return responseFromCache;
  }
  return fetch(request);
}

self.addEventListener("install", (event) => { 
  event.waitUntil(
    addResourcesToCache()
  );
});

self.addEventListener("fetch", (event) => { 
	console.log(event.request);
  event.respondWith(cacheFirst(event.request));
});

self.addEventListener("message", async () => {
	let resourcesjson = await fetch("/resources.json");
	if(resourcesjson.status !== 304) {
		addResourcesToCache(resourcesjson);
	}
});