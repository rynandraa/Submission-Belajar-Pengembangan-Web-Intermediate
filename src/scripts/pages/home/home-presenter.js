import { StoryApi } from '../../data/api.js';
import { sessionHelper } from '../../utils/session-storage.js';

export default class HomePresenter {
  #view;

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
    }, 100);
  }

  async #loadStories() {
    try {
      const result = await StoryApi.getAllStories(1); // 1 = sertakan lokasi

      this.#view.hideLoading();

      if (result.error) {
        this.#view.showError(result.message);
        return;
      }

      const stories = result.listStory;

      if (stories.length === 0) {
        this.#view.showEmpty();
        return;
      }

      this.#view.showStories(stories);
      this.#view.addMapMarkers(stories);

      this.#view.bindStoryCardClick((index) => {
        const markers = this.#view.getMapMarkers();
        if (markers[index]) {
          this.#view.focusMapMarker(markers[index]);
        }
      });
    } catch (e) {
      this.#view.hideLoading();
      this.#view.showError('Gagal memuat stories. Periksa koneksi internet Anda.');
    }
  }
}
