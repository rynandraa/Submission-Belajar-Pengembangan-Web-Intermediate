import { StoryApi } from '../../data/api.js';
import { sessionHelper } from '../../utils/session-storage.js';

export default class AddStoryPresenter {
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

    this.#view.initPickerMap();
    this.#view.setupCamera();
    this.#view.bindSubmit(this.#handleSubmit.bind(this));
  }

  async #handleSubmit() {
    const photoFile = this.#view.getPhotoFile();

    if (!photoFile) {
      this.#view.showError('Silakan sediakan foto terlebih dahulu (Upload atau Kamera).');
      return;
    }

    const { description, lat, lon } = this.#view.getFormData();

    if (!description) {
      this.#view.showError('Deskripsi story tidak boleh kosong.');
      return;
    }

    this.#view.setLoading(true);

    try {
      const response = await StoryApi.addStory(
        description,
        photoFile,
        lat ? parseFloat(lat) : null,
        lon ? parseFloat(lon) : null,
      );

      if (!response.error) {
        this.#view.stopCamera();
        await this.#view.showSuccess('Story Anda telah berhasil dibagikan kepada dunia!');
        this.#view.navigateTo('#/');
      } else {
        this.#view.showError(response.message);
      }
    } catch (err) {
      this.#view.showError('Terjadi kesalahan jaringan. Gagal memposting story.');
    } finally {
      this.#view.setLoading(false);
    }
  }
}
