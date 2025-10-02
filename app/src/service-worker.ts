/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Precache all the build assets (index.html, JS, CSS, etc.)
precacheAndRoute(self.__WB_MANIFEST);

// App Shell routing
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') return false;
    if (url.pathname.startsWith('/_')) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Images folder caching
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/images/'),
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 100 })],
  })
);

// Tests folder caching
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/tests/'),
  new StaleWhileRevalidate({
    cacheName: 'tests',
    plugins: [new ExpirationPlugin({ maxEntries: 50 })],
  })
);

// Force update SW when a new version is available
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
