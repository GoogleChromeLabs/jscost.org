/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict';

var precacheConfig = [["index.html","5b1fd14ab89c04dbbd2f19848b6490c2"],["static/GT-I9505.jpg","2fc2aea55d4a30079df8b6a16d61a74a"],["static/android-chrome-192x192.png","ade08677660702dfb1b293cd1d035544"],["static/android-chrome-512x512.png","6301c444c1e50e9c73a816fffc5c2a04"],["static/android-one.jpg","228e0d901d13aa7cbab8bdc429815ca5"],["static/apple-touch-icon.png","58b6f1f1312a2f0d3186744e437a4272"],["static/ascend-g700.jpg","32c3bd9c14829c21661ae2c83f054582"],["static/ascend-mate-7.jpg","3e4183635803522a45bbd25b072d5538"],["static/asus-zenfone-5.jpg","89b9231839b75f97b87390b672dc2aba"],["static/browserconfig.xml","76af593de861616812b91a41c50bac05"],["static/css/app.2b9ae4e66a66fd5151a047eef1298d3d.css","84f257d094496339f5913cea1da2daa9"],["static/css/app.2b9ae4e66a66fd5151a047eef1298d3d.css.map","2dea81deb0412b58a7d7de9028cf5949"],["static/favicon-16x16.png","385dcbd3d3b1b4cdd3d9a69b2c8c8b1a"],["static/favicon-32x32.png","6a053aaf22f81ad4cbb5174604350a74"],["static/favicon.ico","f26e1594d7ae872d44bd3700fe9f983d"],["static/galaxy-a3.jpg","39e3a67c9ca65d29282a5a45a77a0ca0"],["static/galaxy-note-4.jpg","9d6c1f78feecaaa5ef55357b9c4c2e8e"],["static/galaxy-s5.jpg","946adbabe5419712f50c8001c4f99976"],["static/galaxy-s6.jpg","28a2a9bcc621cec73067125d2662b7b4"],["static/galaxy-s7.jpg","bea85edf332fecba51542bfdc4d76f1e"],["static/htc-one.jpg","5fdc4850e96ca3993cd83fca381f8d1c"],["static/huawei-p9.jpg","db7cf1f5818f2604a880cc52d24dba1c"],["static/ipad-air-2.jpg","f51de9b0287de3af7f87e8cc31880b9a"],["static/ipad-air.jpg","28c4f7e927376d59436b4d4d0ac4e2a8"],["static/ipad-mini-2.jpg","618832709e455b59983efde752b7f56f"],["static/ipad.jpg","c68e5b91e26000c6248b93ab603ea1a7"],["static/iphone-5c.jpg","53a6b2d546a1095be2613e87a2618206"],["static/iphone-5s.jpg","65e5b5bb93330291f7464040002aacda"],["static/iphone-6.jpg","479c55930d9b842ef281f0961a7fad71"],["static/iphone-6s-plus.jpg","b1366b49de05ab77e4a15674f5328435"],["static/iphone-6s.jpg","c329f302c7d19090f35b104a2dfca070"],["static/iphone-7.jpg","42c572a34cfd855ccceec56a4fc7dd10"],["static/js/0.07ebb6e357f7a7a86720.js","cf0e93972e4b6963b07cc663483c8f96"],["static/js/0.07ebb6e357f7a7a86720.js.map","3699469b20ff76a7262e95ebd6da5e6e"],["static/js/app.36739119696be2c1c342.js","5595d378462871e5caf726da2da681f4"],["static/js/app.36739119696be2c1c342.js.map","7fd76168de24d05f3a53a7b7c98a29e5"],["static/js/manifest.96ece122dc5bb16d15b1.js","088b712dfd81ada2663754fb35bb8932"],["static/js/manifest.96ece122dc5bb16d15b1.js.map","56f031d3f23e31e383f7e60f705dbd67"],["static/js/vendor.25252c92ad5d2775f2dc.js","057ab65b2cd1389d8ef977fa03105b27"],["static/lenovo-a6000.jpg","f882262b19a35e25396c3ae35071900d"],["static/lg-g5.jpg","9799ccf52f85a581f3e7840c289ad51f"],["static/lh-h815-g4.jpeg","9fa81527fa9980b4a50d8ea7ffca91ca"],["static/lh-h815-g4.jpg","ba247d3034ce19a9d9a5f56ee20891de"],["static/logo.png","0b87a9980c94e6d4eb4756f56059a501"],["static/logo.svg","05a5700301ade7457f22b54473e73921"],["static/macbook-pro.jpg","f11b96352350cdf588376a19508c63cf"],["static/manifest.json","002ec2979780d7477bc5b295bbcacb3b"],["static/moto-e.jpg","730efc4fc2e64310d89de1b314f2f7d6"],["static/moto-g3.jpg","bd0057c42990688f778384a9f3886f92"],["static/moto-x-1052.jpg","e68d35e246244ede43397705c2189436"],["static/moto-x-1097-2nd-gen.jpg","2095aa16848909ccaf7274d0a7621327"],["static/motog-gen1.jpg","c561558f2402376aeb196bfe8ccc871d"],["static/motog4.jpg","72238c917befd4fc51c63b21a9ef4afe"],["static/ms-640-lumia.jpg","c4eaf9a503a71757020583de4cd4878d"],["static/mstile-150x150.png","8ec3813555cae972b594ec67ddb346fd"],["static/nexus-6p.jpg","e55353f581a2590ce6629e33b7e2e15e"],["static/nexus-7.jpg","78f782e73e2bd813a19f7b2ddca7d1eb"],["static/nexus4.jpg","2ab29b69b9956d39a3facfa28f484222"],["static/nexus5.jpg","dbdcf02d3666ca57673e13117ad78d3c"],["static/nexus5x.jpg","2bed8819532cf79cc381a12da563a659"],["static/oneplus-3.jpg","5bf9ebb72aa592ec83c39a4504e7ddd9"],["static/pixelxl.jpg","2d878f877776b24d9443a7684f4004fe"],["static/redmi.jpg","1303ca99308e0d35a78a34366bf81a6b"],["static/safari-pinned-tab.svg","8c61d3e8f5ba88af03e7d8e85a564ded"],["static/samsung-galaxy-note-ii.jpg","dbe20c2fd7f6ed826950cff2485cb95d"],["static/sony-xperia-z3.jpg","3d81c49eab2d3c1718bd8e72fdee03d8"],["static/surface-pro-4.jpeg","5bb2693550fdb5724dcc7e9f2371c9d1"],["static/thinkpad-t430.jpg","49f4ebe69ff2bd8e567839c8f1311ca4"],["static/xiaomi-mi-41.jpg","ea273b29e57639b64a925dda787df7c7"],["static/xiaomi-mi5.jpg","737d851f4611e780089485cc46ab2734"]];
var cacheName = 'sw-precache-v2-sw-precache-' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var createCacheKey = function (originalUrl, paramName, paramValue,
                           dontCacheBustUrlsMatching) {
    // Create a new URL object to avoid modifying originalUrl.
    var url = new URL(originalUrl);

    // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
    // then add in the extra cache-busting URL parameter.
    if (!dontCacheBustUrlsMatching ||
        !(url.toString().match(dontCacheBustUrlsMatching))) {
      url.search += (url.search ? '&' : '') +
        encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
  };

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function(item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function(requests) {
    return requests.map(function(request) {
      return request.url;
    });
  }).then(function(urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return setOfCachedUrls(cache).then(function(cachedUrls) {
        return Promise.all(
          Array.from(urlsToCacheKeys.values()).map(function(cacheKey) {
            // If we don't have a key matching url in the cache already, add it.
            if (!cachedUrls.has(cacheKey)) {
              return cache.add(new Request(cacheKey, {
                credentials: 'same-origin',
                redirect: 'follow'
              }));
            }
          })
        );
      });
    }).then(function() {
      
      // Force the SW to transition from installing -> active state
      return self.skipWaiting();
      
    })
  );
});

self.addEventListener('activate', function(event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.keys().then(function(existingRequests) {
        return Promise.all(
          existingRequests.map(function(existingRequest) {
            if (!setOfExpectedUrls.has(existingRequest.url)) {
              return cache.delete(existingRequest);
            }
          })
        );
      });
    }).then(function() {
      
      return self.clients.claim();
      
    })
  );
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    var shouldRespond;

    // First, remove all the ignored parameter and see if we have that URL
    // in our cache. If so, great! shouldRespond will be true.
    var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
    shouldRespond = urlsToCacheKeys.has(url);

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    var directoryIndex = 'index.html';
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex);
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    var navigateFallback = '';
    if (!shouldRespond &&
        navigateFallback &&
        (event.request.mode === 'navigate') &&
        isPathWhitelisted([], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString();
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      event.respondWith(
        caches.open(cacheName).then(function(cache) {
          return cache.match(urlsToCacheKeys.get(url)).then(function(response) {
            if (response) {
              return response;
            }
            throw Error('The cached response that was expected is missing.');
          });
        }).catch(function(e) {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});







