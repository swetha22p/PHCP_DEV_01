// service-worker.js

const CACHE_NAME = 'offline-react-app';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/home/account',
                  '/home/dashboard',
                  '/data/overview',
                  '/data/details',
                  '/groups/assistants',
                  '/groups/medical-assistants',
                  '/tools/drives-forms',
                  '/tools/screening-apis',
                  '/assets/icons/web/active/home.svg',
                  '/assets/icons/web/active/hamburger.svg',
                  '/assets/icons/web/active/data.svg',
                  '/assets/icons/web/active/groups.svg',
                  '/assets/icons/web/active/search-icon.svg',
                  '/assets/icons/web/active/signout.svg',
                  '/assets/icons/web/active/tools.svg',
                  '/assets/icons/web/non-active/home.svg',
                  '/assets/icons/web/non-active/hamburger.svg',
                  '/assets/icons/web/non-active/data.svg',
                  '/assets/icons/web/non-active/groups.svg',
                  '/assets/icons/web/non-active/search-icon.svg',
                  '/assets/icons/web/non-active/signout.svg',
                  '/assets/icons/web/non-active/tools.svg',
                  '/assets/icons/mobile/active/data.svg',
                  '/assets/icons/mobile/active/groups.svg',
                  '/assets/icons/mobile/active/home.svg',
                  '/assets/icons/mobile/active/tools.svg',
                  '/assets/icons/mobile/non-active/data.svg',
                  '/assets/icons/mobile/non-active/groups.svg',
                  '/assets/icons/mobile/non-active/home.svg',
                  '/assets/icons/mobile/non-active/tools.svg',
                  '/assets/icons/mobile/non-active/signout.svg',
                  '/assets/icons/common/calendar.svg',
                  '/assets/icons/common/createform.svg',
                  '/assets/icons/common/delete.svg',
                  '/assets/icons/common/fileupload.svg',
                  '/assets/icons/common/info.svg',
                  '/assets/icons/common/user.svg',
                  '/assets/images/banner.svg',
                  '/assets/images/user_profile.svg',
                 
                  '/assets/icons/web/non-active/user.svg',
                 
                 




  // 
  //                 '/form1',
  //                 '/getdata'
  // Add more paths to cache as needed
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
