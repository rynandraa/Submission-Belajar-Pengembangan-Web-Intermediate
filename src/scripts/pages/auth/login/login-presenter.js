import { StoryApi } from '../../../data/api.js';
import { sessionHelper } from '../../../utils/session-storage.js';

export default class LoginPresenter {
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

    this.#view.bindSubmit(this.#handleLogin.bind(this));
  }

  async #handleLogin({ email, password }) {
    this.#view.setLoading(true);

    try {
      const response = await StoryApi.login(email, password);

      if (!response.error) {
        sessionHelper.setToken(response.loginResult.token);
        await this.#view.showSuccess('Login berhasil! Selamat datang kembali.');
        this.#view.reload();
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
