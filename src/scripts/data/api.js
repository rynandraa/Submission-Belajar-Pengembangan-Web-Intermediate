import { sessionHelper } from '../utils/session-storage.js';
import { idbHelper } from './idb-helper.js';
const BASE_URL = 'https://story-api.dicoding.dev/v1';

export const StoryApi = {
  async register(name, email, password) {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  async login(email, password) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async getAllStories(location = 1) {
    const token = sessionHelper.getToken();
    try {
      const response = await fetch(`${BASE_URL}/stories?location=${location}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      // Cache to IDB if success
      if (!data.error && data.listStory) {
        await idbHelper.putStoriesCache(data.listStory);
      }
      return data;
    } catch (error) {
      // Offline fallback: Use IDB
      console.warn('Network error, fetching from IndexedDB cache...');
      const cachedStories = await idbHelper.getAllStoriesCache();
      if (cachedStories && cachedStories.length > 0) {
        return {
          error: false,
          message: 'Fetched from cache',
          listStory: cachedStories
        };
      }
      throw error;
    }
  },

  async addStory(description, photo, lat, lon) {
    const token = sessionHelper.getToken();
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat !== undefined && lon !== undefined && lat !== null && lon !== null) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    // Dicoding specification: Add guest form data if needed (it is authenticated API mostly so token should work)

    try {
      const response = await fetch(`${BASE_URL}/stories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      return response.json();
    } catch (error) {
      console.warn('Network error, pushing to sync queue...');
      await idbHelper.putSyncQueue({
        id: Date.now(), // Generate local ID
        description,
        photo, // Assuming Blob/File can be stored in IDB (it can be)
        lat,
        lon
      });

      // Register background sync if supported
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const swRegistration = await navigator.serviceWorker.ready;
          await swRegistration.sync.register('sync-add-story');
        } catch (err) {
          console.error('Failed to register background sync', err);
        }
      }

      return {
        error: false,
        message: 'Story is saved offline and will be uploaded automatically when online.'
      };
    }
  },

  async getStoryDetail(id) {
    const token = sessionHelper.getToken();
    const response = await fetch(`${BASE_URL}/stories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async subscribeNotification(subscription) {
    const token = sessionHelper.getToken();
    const payload = subscription.toJSON
      ? subscription.toJSON()
      : subscription;

    const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: payload.endpoint,
        keys: payload.keys,
      }),
    });
    return response.json();
  },

  async unsubscribeNotification(endpoint) {
    const token = sessionHelper.getToken();
    const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });
    return response.json();
  },
};
