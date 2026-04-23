import LoginPresenter from './login-presenter.js';

export default class LoginPage {
  #presenter;

  async render() {
    return `
      <div class="view-container">
        <div class="auth-wrapper">
          <div class="auth-header">
            <div class="auth-icon-wrap">
              <i class="fas fa-sign-in-alt"></i>
            </div>
            <h1 class="content-title text-center">Login</h1>
            <p class="auth-subtitle">Masuk ke akun StoryApp Anda</p>
          </div>

          <form id="login-form" novalidate>
            <div class="form-group">
              <label for="email"><i class="fas fa-envelope"></i> Email</label>
              <input
                type="email"
                id="email"
                class="form-control"
                placeholder="contoh@email.com"
                required
                autocomplete="email"
              />
            </div>
            <div class="form-group">
              <label for="password"><i class="fas fa-lock"></i> Password</label>
              <input
                type="password"
                id="password"
                class="form-control"
                placeholder="Minimal 8 karakter"
                minlength="8"
                required
                autocomplete="current-password"
              />
            </div>
            <button type="submit" id="login-submit" class="btn btn-block">
              <i class="fas fa-sign-in-alt"></i> Login
            </button>
          </form>

          <div class="auth-footer-link">
            Belum punya akun? <a href="#/register">Daftar sekarang</a>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({ view: this });
    this.#presenter.initialize();
  }

  // ── View Methods (dipanggil oleh Presenter) ──────────────────────────────

  bindSubmit(handler) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      await handler({ email, password });
    });
  }

  setLoading(isLoading) {
    const btn = document.getElementById('login-submit');
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
      ? '<i class="fas fa-spinner fa-spin"></i> Memproses...'
      : '<i class="fas fa-sign-in-alt"></i> Login';
  }

  showError(message) {
    Swal.fire({
      icon: 'error',
      title: 'Login Gagal',
      text: message,
      confirmButtonColor: '#4f46e5',
    });
  }

  async showSuccess(message) {
    return Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: message,
      timer: 1500,
      showConfirmButton: false,
    });
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }

  reload() {
    window.location.reload();
  }
}
