import RegisterPresenter from './register-presenter.js';

export default class RegisterPage {
  #presenter;

  async render() {
    return `
      <div class="view-container">
        <div class="auth-wrapper">
          <div class="auth-header">
            <div class="auth-icon-wrap">
              <i class="fas fa-user-plus"></i>
            </div>
            <h1 class="content-title text-center">Daftar Akun</h1>
            <p class="auth-subtitle">Bergabung dengan komunitas StoryApp</p>
          </div>

          <form id="register-form" novalidate>
            <div class="form-group">
              <label for="name"><i class="fas fa-user"></i> Nama Lengkap</label>
              <input
                type="text"
                id="name"
                class="form-control"
                placeholder="Masukkan nama Anda"
                required
                autocomplete="name"
              />
            </div>
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
                placeholder="Buat password (min. 8 karakter)"
                minlength="8"
                required
                autocomplete="new-password"
              />
            </div>
            <button type="submit" id="register-submit" class="btn btn-block">
              <i class="fas fa-user-plus"></i> Daftar Sekarang
            </button>
          </form>

          <div class="auth-footer-link">
            Sudah punya akun? <a href="#/login">Login di sini</a>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({ view: this });
    this.#presenter.initialize();
  }

  // ── View Methods (dipanggil oleh Presenter) ──────────────────────────────

  bindSubmit(handler) {
    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      await handler({ name, email, password });
    });
  }

  setLoading(isLoading) {
    const btn = document.getElementById('register-submit');
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
      ? '<i class="fas fa-spinner fa-spin"></i> Mendaftar...'
      : '<i class="fas fa-user-plus"></i> Daftar Sekarang';
  }

  showError(message) {
    Swal.fire({
      icon: 'error',
      title: 'Pendaftaran Gagal',
      text: message,
      confirmButtonColor: '#4f46e5',
    });
  }

  async showSuccess(message) {
    return Swal.fire({
      icon: 'success',
      title: 'Pendaftaran Berhasil!',
      text: message,
      confirmButtonColor: '#4f46e5',
    });
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }
}
