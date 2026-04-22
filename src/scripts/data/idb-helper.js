import { openDB } from 'idb';

const DATABASE_NAME = 'storyapp-db';
const DATABASE_VERSION = 1;

const OBJECT_STORE_NAME = {
  FAVORITES: 'favorites',
  STORIES_CACHE: 'stories-cache',
  SYNC_QUEUE: 'sync-queue'
};

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAME.FAVORITES)) {
      database.createObjectStore(OBJECT_STORE_NAME.FAVORITES, { keyPath: 'id' });
    }
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAME.STORIES_CACHE)) {
      database.createObjectStore(OBJECT_STORE_NAME.STORIES_CACHE, { keyPath: 'id' });
    }
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAME.SYNC_QUEUE)) {
      database.createObjectStore(OBJECT_STORE_NAME.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
    }
  },
});

export const idbHelper = {
  /* --- FAVORITES FEATURE --- */
  async getFavorite(id) {
    return (await dbPromise).get(OBJECT_STORE_NAME.FAVORITES, id);
  },
  async getAllFavorites() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME.FAVORITES);
  },
  async putFavorite(story) {
    return (await dbPromise).put(OBJECT_STORE_NAME.FAVORITES, story);
  },
  async deleteFavorite(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME.FAVORITES, id);
  },

  /* --- STORIES CACHE --- */
  async putStoriesCache(stories) {
    const tx = (await dbPromise).transaction(OBJECT_STORE_NAME.STORIES_CACHE, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME.STORIES_CACHE);
    await store.clear(); // Clear old cache
    for (const story of stories) {
      await store.put(story);
    }
    await tx.done;
  },
  async getAllStoriesCache() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME.STORIES_CACHE);
  },

  /* --- SYNC QUEUE --- */
  async putSyncQueue(data) {
    return (await dbPromise).put(OBJECT_STORE_NAME.SYNC_QUEUE, data);
  },
  async getAllSyncQueue() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME.SYNC_QUEUE);
  },
  async deleteSyncQueue(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME.SYNC_QUEUE, id);
  }
};
