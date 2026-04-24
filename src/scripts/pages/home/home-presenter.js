import { StoryApi } from '../../data/api.js';
import { sessionHelper } from '../../utils/session-storage.js';
import { PushManager } from '../../utils/push-manager.js';
import { idbHelper } from '../../data/idb-helper.js';

export default class HomePresenter {
  #view;
  #allStories = [];
  #favoriteIds = new Set();

  constructor({ view }) {
    this.#view = view;
  }

  // ── Presenter Methods (logika bisnis, tidak ada DOM manipulation) ─────────

  async initialize() {
    if (!sessionHelper.isLoggedIn()) {
      this.#view.navigateTo('#/login');
      return;
    }

    // Beri waktu DOM render sebelum Leaflet mengakses container
    setTimeout(async () => {
      this.#view.initMap([-6.2, 106.816666]);
      await this.#loadFavoriteIds();
      await this.#loadStories();
      await this.#loadPendingStories();
      this.#initInteractivity();
      this.#initPushManager();
    }, 100);
  }
  
  async #initPushManager() {
    try {
      const currentSub = await PushManager.getSubscription();
      this.#view.updatePushToggleUI(!!currentSub);

      this.#view.bindPushToggle(async () => {
        try {
          const sub = await PushManager.getSubscription();
          if (sub) {
            await PushManager.unsubscribe();
            this.#view.updatePushToggleUI(false);
          } else {
            await PushManager.subscribe();
            this.#view.updatePushToggleUI(true);
          }
        } catch (e) {
          console.error('Push toggle error:', e);
          this.#view.showError('Gagal mengatur Push Notification. Izin mungkin diblokir.');
        }
      });
    } catch (e) {
      console.warn('Push manager init failed', e);
    }
  }

  #initInteractivity() {
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');

    if (!searchInput || !sortSelect) return;

    const applyFilters = () => {
      const query = searchInput.value.toLowerCase();
      const sort = sortSelect.value;

      let filtered = this.#allStories.filter(s => s.name.toLowerCase().includes(query));

      if (sort === 'oldest') {
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      this.#renderStories(filtered);
    };

    searchInput.addEventListener('input', applyFilters);
    sortSelect.addEventListener('change', applyFilters);
  }

  async #loadStories() {
    try {
      const result = await StoryApi.getAllStories(1); // 1 = sertakan lokasi

      this.#view.hideLoading();

      if (result.error) {
        this.#view.showError(result.message);
        return;
      }

      this.#allStories = result.listStory || [];

      if (this.#allStories.length === 0) {
        this.#view.showEmpty();
        return;
      }
      
      // Default sort (newest)
      this.#allStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      this.#renderStories(this.#allStories);
    } catch (e) {
      this.#view.hideLoading();
      this.#view.showError('Gagal memuat stories. Periksa koneksi internet Anda.');
    }
  }

  #renderStories(stories) {
    if (stories.length === 0) {
      this.#view.showEmpty(); // Note: showEmpty removes all cards visually
    } else {
      this.#view.showStories(stories, this.#favoriteIds);
      this.#view.addMapMarkers(stories);

      this.#view.bindFavoriteToggle(async (storyId) => {
        await this.#toggleFavorite(storyId);
      });
    }
  }

  async #loadPendingStories() {
    try {
      const pending = await idbHelper.getAllSyncQueue();
      this.#view.showPendingStories(pending);
    } catch (e) {
      console.warn('Failed to load pending stories', e);
    }
  }

  async #loadFavoriteIds() {
    try {
      const favorites = await idbHelper.getAllFavorites();
      this.#favoriteIds = new Set((favorites || []).map((story) => story.id));
    } catch (error) {
      console.warn('Failed to load favorite story IDs', error);
      this.#favoriteIds = new Set();
    }
  }

  async #toggleFavorite(storyId) {
    try {
      const targetStory = this.#allStories.find((story) => story.id === storyId);
      if (!targetStory) {
        return;
      }

      const isAlreadyFavorite = this.#favoriteIds.has(storyId);

      if (isAlreadyFavorite) {
        await idbHelper.deleteFavorite(storyId);
        this.#favoriteIds.delete(storyId);
        this.#view.updateFavoriteButton(storyId, false);
        return;
      }

      await idbHelper.putFavorite(targetStory);
      this.#favoriteIds.add(storyId);
      this.#view.updateFavoriteButton(storyId, true);
    } catch (error) {
      this.#view.showError('Gagal menyimpan story ke IndexedDB.');
    }
  }
}
