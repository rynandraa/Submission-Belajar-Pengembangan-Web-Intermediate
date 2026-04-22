import { StoryApi } from '../../data/api.js';
import { sessionHelper } from '../../utils/session-storage.js';
import { getIdFromActiveUrl } from '../../routes/url-parser.js';

export default class DetailPresenter {
  #view;

  constructor({ view }) {
    this.#view = view;
  }

  async initialize() {
    if (!sessionHelper.isLoggedIn()) {
      this.#view.navigateTo('#/login');
      return;
    }

    const storyId = getIdFromActiveUrl();
    if (!storyId) {
      this.#view.showError('ID Story tidak ditemukan.');
      return;
    }

    await this.#loadStoryDetail(storyId);
  }

  async #loadStoryDetail(id) {
    this.#view.showLoading();
    try {
      const result = await StoryApi.getStoryDetail(id);
      
      this.#view.hideLoading();

      if (result.error) {
        this.#view.showError(result.message);
        return;
      }

      const story = result.story;
      this.#view.showDetail(story);
    } catch (e) {
      this.#view.hideLoading();
      this.#view.showError('Gagal memuat detail story. Periksa koneksi internet Anda.');
    }
  }
}
