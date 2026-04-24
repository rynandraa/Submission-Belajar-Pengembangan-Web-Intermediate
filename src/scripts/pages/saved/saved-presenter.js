import { idbHelper } from '../../data/idb-helper.js';
import { sessionHelper } from '../../utils/session-storage.js';

export default class SavedPresenter {
  #view;

  constructor({ view }) {
    this.#view = view;
  }

  async initialize() {
    if (!sessionHelper.isLoggedIn()) {
      this.#view.navigateTo('#/login');
      return;
    }

    await this.#loadFavorites();
  }

  async #loadFavorites() {
    this.#view.showLoading();

    try {
      const favorites = await idbHelper.getAllFavorites();
      this.#view.hideLoading();

      if (!favorites || favorites.length === 0) {
        this.#view.showEmpty();
        return;
      }

      const sortedFavorites = favorites.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      this.#view.showFavorites(sortedFavorites);
      this.#bindDeleteAction();
    } catch (error) {
      this.#view.hideLoading();
      this.#view.showError('Gagal memuat data story tersimpan.');
    }
  }

  #bindDeleteAction() {
    this.#view.bindDeleteFavorite(async (storyId) => {
      try {
        const shouldDelete = await this.#view.confirmDelete();
        if (!shouldDelete) {
          return;
        }

        await idbHelper.deleteFavorite(storyId);
        this.#view.showDeleteSuccess();
        await this.#loadFavorites();
      } catch (error) {
        this.#view.showError('Gagal menghapus story dari IndexedDB.');
      }
    });
  }
}
