const cacheData = "appV1";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(cacheData).then((cache) => {
            return cache.addAll([
               '/rcts/phcp/',
               '/rcts/phcp/home/account',
               '/rcts/phcp/home/dashboard',
               '/rcts/phcp/data/overview',
               '/rcts/phcp/data/details',
               '/rcts/phcp/groups/assistants',
               '/rcts/phcp/groups/medical-assistants',
               '/rcts/phcp/tools/drives-forms',
               '/rcts/phcp/tools/screening-apis',

            ]);
        })
    );
});

self.addEventListener("fetch", (event) => {
    if (!navigator.onLine) {
        event.respondWith(
            caches.match(event.request).then((resp) => {
                if (resp) {
                    return resp;
                } else if (event.request.url.includes('/test/audio_')) {
                    return caches.match(event.request.url);
                } else {
                    let requestUrl = event.request.clone();
                    return fetch(requestUrl);
                }
            }).catch((error) => {
                console.error('Fetch error:', error);
            })
        );
    } else {
        event.respondWith(
            fetch(event.request).then((response) => {
                let responseClone = response.clone();
                if (event.request.url.match(/\.(png|wav)$/i)) {
                    // Do not cache PNG and WAV files
                    return response;
                } else {
                    caches.open(cacheData).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                }
            }).catch((error) => {
                console.error('Fetch error:', error);
                // Handle fetch errors, e.g., return a custom offline page
            })
        );
    }
});

