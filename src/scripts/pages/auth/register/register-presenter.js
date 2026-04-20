import { StoryApi } from '../../../data/api.js';
import { sessionHelper } from '../../../utils/session-storage.js';

export default class RegisterPresenter {
  #view;

  constructor({ view }) {
    this.#view = view;
  }

  // ── Presenter Methods (logika bisnis, tidak ada DOM manipulation) ─────────

  initialize() {
    // Jika sudah login, redirect ke home
    if (sessionHelper.isLoggedIn()) {
      this.#view.navigateTo('#/');
      return;
    }

    this.#view.bindSubmit(this.#handleRegister.bind(this));
  }

  async #handleRegister({ name, email, password }) {
    this.#view.setLoading(true);

    try {
      const response = await StoryApi.register(name, email, password);

      if (!response.error) {
        await this.#view.showSuccess(
          'Akun berhasil dibuat! Silakan login untuk melanjutkan.',
        );
        this.#view.navigateTo('#/login');
      } else {
        this.#view.showError(response.message);
      }
    } catch (err) {
      this.#view.showError('Terjadi kesalahan jaringan. Silakan periksa koneksi Anda.');
    } finally {
      this.#view.setLoading(false);
    }
  }
}
