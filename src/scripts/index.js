import App from './app.js';
import '../styles/styles.css';
import '../styles/view-transitions.css';
import '../styles/responsive.css';
import { StoryApi } from './data/api.js';
import { idbHelper } from './data/idb-helper.js';

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.querySelector('#content');
  const app = new App({ content });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  // PWA & Service Worker Registration
  if ('serviceWorker' in navigator) {
    try {
      const { Workbox } = require('workbox-window');
      const wb = new Workbox('/sw.js');

      // Listen for message from service worker for background sync
      navigator.serviceWorker.addEventListener('message', async (event) => {
        if (event.data && event.data.type === 'SYNC_STORY') {
          const item = event.data.payload;
          try {
            console.log('Background sync uploading story...', item);
            await StoryApi.addStory(item.description, item.photo, item.lat, item.lon);
            await idbHelper.deleteSyncQueue(item.id);
            console.log('Successfully synced offline story!');
          } catch (e) {
            console.error('Sync failed to upload:', e);
          }
        }
      });

      await wb.register();
      console.log('Service Worker Registered');
    } catch (err) {
      console.error('Service Worker registration failed:', err);
    }
  }
});
