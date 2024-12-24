/* jshint worker: true */
/* globals caches, self*/

async function addResourcesToCache(r) {
  const cache = await caches.open("v1"); 
  const resources = r || await fetch("/resources.json");
  const json = await resources.json();
  let client = await self.clients.matchAll();
  cache.addAll(json).then(() => {
	if(!client[0]) return;
  
	client[0].postMessage("Resources are saved in cache.");
	console.log("All resources loaded!");
  });
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

self.addEventListener("message", async (e) => {
	let resourcesjson = await fetch("/resources.json", {
		headers: {
			"If-Modified-Since": e.data.date
		}
	});
	if(resourcesjson.status !== 304) {
		addResourcesToCache(resourcesjson);
	} else {
		let cliente = await self.clients.matchAll();
		cliente[0].postMessage("No change.");
	}
});