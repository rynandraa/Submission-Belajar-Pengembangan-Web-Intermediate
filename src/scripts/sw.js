import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { StoryApi } from './data/api'; // Useful if we want to resolve sync
import { idbHelper } from './data/idb-helper';

// Precache the app shell
precacheAndRoute(self.__WB_MANIFEST);

// Cache assets (images, fonts, stylesheets)
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'style' || request.destination === 'font' || request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Cache API requests (Network First for stories endpoint)
registerRoute(
  ({ url }) => url.href.includes('story-api.dicoding.dev/v1/stories'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
      }),
    ],
  })
);

// Background Sync Event Listener
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-add-story') {
    event.waitUntil(syncAddStory());
  }
});

async function syncAddStory() {
  const syncItems = await idbHelper.getAllSyncQueue();
  for (const item of syncItems) {
    try {
      // Re-initialize formData from IDB
      // Assuming api.js or similar helper handles the token.
      // We stored the token or we can get it from clients if needed?
      // Actually, SW doesn't have access to sessionStorage where token is stored!
      // This is a known caveat with sessionStorage + Background Sync.
      // So let's send a postMessage to clients to do the sync OR fetch token from IndexedDB if we change token storage.
      await syncItemWithClient(item);
    } catch (err) {
      console.error('Error syncing item:', item.id, err);
    }
  }
}

async function syncItemWithClient(item) {
  const clients = await self.clients.matchAll();
  if (clients && clients.length > 0) {
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_STORY', payload: item });
    });
  }
}

// Push Notification Event Listener
self.addEventListener('push', (event) => {
  let pushData = { title: 'StoryApp', body: 'Story baru telah ditambahkan!' };
  
  if (event.data) {
    try {
      pushData = event.data.json();
    } catch (e) {
      pushData.body = event.data.text();
    }
  }

  const options = {
    body: pushData.body || pushData.message || 'Cek aplikasi untuk update.',
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    vibrate: [100, 50, 100],
    data: pushData.data || { url: '/#/' }, // Data for navigation
    actions: [
      { action: 'open', title: 'Buka App' },
      { action: 'close', title: 'Tutup' }
    ]
  };

  event.waitUntil(self.registration.showNotification(pushData.title, options));
});

// Notification Click Event Listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action !== 'close') {
    const targetUrl = event.notification.data.url || '/#/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // If app is already open, focus it and navigate
        if (windowClients.length > 0) {
          const client = windowClients[0];
          client.focus();
          return client.navigate(targetUrl);
        }
        // If app is closed, open it in a new window
        return clients.openWindow(targetUrl);
      })
    );
  }
});
