import { StoryApi } from '../../data/api.js';
import { sessionHelper } from '../../utils/session-storage.js';
import { PushManager } from '../../utils/push-manager.js';

export default class HomePresenter {
  #view;
  #allStories = [];

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
      await this.#loadStories();
      this.#initInteractivity();
      this.#initPushManager();
    }, 100);
  }
  
  async #initPushManager() {
    const toggleBtn = document.getElementById('push-toggle-btn');
    const toggleText = document.getElementById('push-toggle-text');
    if (!toggleBtn) return;

    try {
      const currentSub = await PushManager.getSubscription();
      const updateUI = (isSubscribed) => {
        if (isSubscribed) {
          toggleText.textContent = 'Disable Notifications';
          toggleBtn.classList.remove('btn-secondary');
          toggleBtn.classList.add('btn-danger');
        } else {
          toggleText.textContent = 'Enable Notifications';
          toggleBtn.classList.remove('btn-danger');
          toggleBtn.classList.add('btn-secondary');
        }
      };
      updateUI(!!currentSub);

      toggleBtn.addEventListener('click', async () => {
        try {
          const sub = await PushManager.getSubscription();
          if (sub) {
            await PushManager.unsubscribe();
            updateUI(false);
          } else {
            await PushManager.subscribe();
            updateUI(true);
          }
        } catch (e) {
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
      this.#view.showStories(stories);
      this.#view.addMapMarkers(stories);

      this.#view.bindStoryCardClick((index) => {
        const markers = this.#view.getMapMarkers();
        if (markers[index]) {
          this.#view.focusMapMarker(markers[index]);
        }
      });
    }
  }
}
