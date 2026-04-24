import SavedPresenter from './saved-presenter.js';

export default class SavedPage {
  #presenter;

  async render() {
    return `
      <div class="view-container">
        <nav aria-label="breadcrumb" class="breadcrumb-container" style="margin-bottom: 20px;">
          <a href="#/" class="breadcrumb-link"><i class="fas fa-home"></i> Home</a>
          <span class="breadcrumb-separator"><i class="fas fa-chevron-right"></i></span>
          <span class="breadcrumb-current" aria-current="page">Story Tersimpan</span>
        </nav>

        <h1 class="content-title">
          <i class="fas fa-bookmark"></i> Story Tersimpan
        </h1>

        <div id="loader" class="loader"></div>
        <div id="saved-story-list" class="container" style="display: none;"></div>
      </div>
    `;
  }

  async afterRender() {
    this.#presenter = new SavedPresenter({ view: this });
    await this.#presenter.initialize();
  }

  showLoading() {
    document.getElementById('loader').style.display = 'block';
  }

  hideLoading() {
    document.getElementById('loader').style.display = 'none';
  }

  showError(message) {
    Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: message,
      confirmButtonColor: '#4f46e5',
    });
  }

  showEmpty() {
    const container = document.getElementById('saved-story-list');
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-bookmark fa-3x"></i>
        <p>Belum ada story yang disimpan.</p>
        <a href="#/" class="btn saved-empty-btn"><i class="fas fa-compass"></i> Jelajahi Story</a>
      </div>
    `;
    container.style.display = 'block';
  }

  showFavorites(stories) {
    const container = document.getElementById('saved-story-list');
    container.innerHTML = stories.map((story) => this.#createSavedStoryCard(story)).join('');
    container.style.display = 'grid';
  }

  bindDeleteFavorite(handler) {
    const buttons = document.querySelectorAll('.delete-favorite-btn');
    buttons.forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        const { storyId } = button.dataset;
        await handler(storyId);
      });
    });
  }

  async confirmDelete() {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Story Tersimpan?',
      text: 'Story akan dihapus dari daftar simpan.',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    });

    return result.isConfirmed;
  }

  showDeleteSuccess() {
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Story tersimpan berhasil dihapus.',
      timer: 1400,
      showConfirmButton: false,
    });
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }

  #createSavedStoryCard(story) {
    const defaultImg = 'https://placehold.co/400x200?text=No+Image';
    const imgUrl = story.photoUrl || defaultImg;
    const dateStr = new Date(story.createdAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <article class="story-card" tabindex="0" aria-label="Story tersimpan dari ${story.name}">
        <img src="${imgUrl}" alt="Foto story tersimpan oleh ${story.name}" loading="lazy">
        <div class="story-card-body">
          <h2 class="story-card-title">
            <i class="fas fa-user-circle"></i> ${story.name}
          </h2>
          <time class="story-card-date" datetime="${story.createdAt}">
            <i class="fas fa-calendar-alt"></i> ${dateStr}
          </time>
          <p class="story-card-desc">${story.description}</p>
          <div class="story-card-actions" style="margin-top: auto;">
            <a href="#/detail/${story.id}" class="btn btn-sm">
              <i class="fas fa-eye"></i> Lihat Detail
            </a>
            <button
              type="button"
              class="btn btn-sm btn-danger delete-favorite-btn"
              data-story-id="${story.id}"
              aria-label="Hapus story tersimpan ${story.name}"
            >
              <i class="fas fa-trash-alt"></i> Hapus
            </button>
          </div>
        </div>
      </article>
    `;
  }
}
