import App from './app.js';
import '../styles/styles.css';
import '../styles/view-transitions.css';
import '../styles/responsive.css';

// NPM Imports for Libraries
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Swal from 'sweetalert2';
import { Workbox } from 'workbox-window';

// Fix Leaflet Default Icon issue with Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Set globals for components that expect them
window.Swal = Swal;
window.L = L;

import { StoryApi } from './data/api.js';
import { idbHelper } from './data/idb-helper.js';

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.querySelector('#content');
  const app = new App({ content });

  // PWA & Service Worker Registration
  if ('serviceWorker' in navigator) {
    try {
      const wb = new Workbox('./sw.js');

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

  // Handle Initial Route (Stabilized to avoid double render)
  const render = () => app.renderPage();
  window.addEventListener('hashchange', render);

  if (!window.location.hash || window.location.hash === '#') {
    window.location.hash = '#/';
  } else {
    render();
  }
});
