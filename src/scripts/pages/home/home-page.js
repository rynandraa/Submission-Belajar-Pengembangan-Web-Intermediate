import HomePresenter from './home-presenter.js';
import { mapHelper } from '../../utils/map-helper.js';

export default class HomePage {
  #presenter;

  async render() {
    return `
      <div class="view-container">
        <div class="home-header-row">
          <h1 class="content-title" style="margin-bottom: 0; width: auto; grid-column: auto;">
            <i class="fas fa-book-open"></i> Dashboard Stories
          </h1>
          <div class="home-header-action">
            <button id="push-toggle-btn" class="btn btn-secondary" style="font-size: 0.85rem;">
              <i class="fas fa-bell"></i> <span id="push-toggle-text">Enable Notifications</span>
            </button>
          </div>
        </div>

        <!-- Peta interaktif dengan layer control -->
        <div
          class="map-container"
          id="story-map"
          tabindex="0"
          aria-label="Peta lokasi cerita di seluruh dunia"
          role="application"
        ></div>

        <section class="toolbar">
          <div class="search-group">
            <label for="search-input" class="toolbar-label">Cari nama pembuat story</label>
            <input type="text" id="search-input" class="form-control" placeholder="Cari nama pembuat story..." />
          </div>
          <div class="sort-group">
            <label for="sort-select" class="toolbar-label">Urutkan:</label>
            <select id="sort-select" class="form-control">
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
          </div>
        </section>

        <!-- Section for Offline Pending Stories -->
        <div id="pending-stories-container" style="display: none; margin-top: 24px;"></div>

        <!-- Loader -->
        <div id="loader" class="loader"></div>

        <!-- Daftar story -->
        <div id="story-list" class="container" style="margin-top: 24px; display: none;"></div>
      </div>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({ view: this });
    await this.#presenter.initialize();
  }

  // ── View Methods (dipanggil oleh Presenter) ──────────────────────────────

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
    const container = document.getElementById('story-list');
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox fa-3x"></i>
        <p>Belum ada story. Jadilah yang pertama berbagi!</p>
        <a href="#/add-story" class="btn"><i class="fas fa-plus"></i> Tambah Story</a>
      </div>
    `;
    container.style.display = 'block';
  }

  showStories(stories, favoriteIds = new Set()) {
    const container = document.getElementById('story-list');
    container.innerHTML = stories.map((s) => this.#createStoryCard(s, favoriteIds.has(s.id))).join('');
    container.style.display = 'grid';
  }

  initMap(center) {
    mapHelper.initMap('story-map', center, true);
  }

  addMapMarkers(stories) {
    mapHelper.addMarkers(stories);
  }

  showPendingStories(pendingStories) {
    const container = document.getElementById('pending-stories-container');
    if (!pendingStories || pendingStories.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.innerHTML = `
      <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h2 style="color: #92400e; font-size: 1.1rem; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-clock"></i> Stories Menunggu Sinkronisasi (${pendingStories.length})
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">
          ${pendingStories
            .map(
              (s) => `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; display: flex; gap: 10px; align-items: center;">
              <div style="width: 50px; height: 50px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                ${
                  s.photo
                    ? `<img src="${URL.createObjectURL(s.photo)}" alt="Preview story offline: ${s.description || 'Tanpa deskripsi'}" style="width: 100%; height: 100%; object-fit: cover;">`
                    : '<i class="fas fa-image text-gray-400"></i>'
                }
              </div>
              <div style="flex: 1; min-width: 0;">
                <p style="font-size: 0.85rem; font-weight: 500; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${
                  s.description
                }</p>
                <span style="font-size: 0.75rem; color: #6b7280;">Akan di-upload otomatis</span>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
    container.style.display = 'block';
  }

  getMapMarkers() {
    return mapHelper.markers;
  }

  focusMapMarker(marker) {
    mapHelper.map.setView(marker.getLatLng(), 13, { animate: true });
    marker.openPopup();
    document.getElementById('story-map').scrollIntoView({ behavior: 'smooth' });
  }
  
  updatePushToggleUI(isSubscribed) {
    const toggleBtn = document.getElementById('push-toggle-btn');
    const toggleText = document.getElementById('push-toggle-text');
    if (!toggleBtn || !toggleText) return;

    if (isSubscribed) {
      toggleText.textContent = 'Disable Notifications';
      toggleBtn.classList.remove('btn-secondary');
      toggleBtn.classList.add('btn-danger');
    } else {
      toggleText.textContent = 'Enable Notifications';
      toggleBtn.classList.remove('btn-danger');
      toggleBtn.classList.add('btn-secondary');
    }
  }

  bindPushToggle(handler) {
    const toggleBtn = document.getElementById('push-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', handler);
    }
  }

  bindFavoriteToggle(handler) {
    const buttons = document.querySelectorAll('.favorite-toggle-btn');
    buttons.forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const { storyId } = button.dataset;
        await handler(storyId);
      });
    });
  }

  updateFavoriteButton(storyId, isFavorite) {
    const buttons = document.querySelectorAll('.favorite-toggle-btn');
    buttons.forEach((button) => {
      if (button.dataset.storyId !== storyId) {
        return;
      }

      button.classList.toggle('is-favorite', isFavorite);
      button.setAttribute('aria-pressed', isFavorite ? 'true' : 'false');
      button.setAttribute(
        'aria-label',
        isFavorite ? 'Hapus dari story tersimpan' : 'Simpan story ini',
      );
      button.innerHTML = isFavorite
        ? '<i class="fas fa-bookmark"></i>'
        : '<i class="far fa-bookmark"></i>';
    });
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  #createStoryCard(story, isFavorite = false) {
    const defaultImg = 'https://placehold.co/400x200?text=No+Image';
    const imgUrl = story.photoUrl || defaultImg;
    const dateStr = new Date(story.createdAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <article class="story-card" aria-label="Story dari ${story.name}">
        <img src="${imgUrl}" alt="Foto yang dibagikan oleh ${story.name}" loading="lazy">
        <div class="story-card-body">
          <div class="story-card-header-row">
            <h2 class="story-card-title">
              <i class="fas fa-user-circle"></i> ${story.name}
            </h2>
            <button
              type="button"
              class="favorite-toggle-btn ${isFavorite ? 'is-favorite' : ''}"
              data-story-id="${story.id}"
              aria-label="${isFavorite ? 'Hapus dari story tersimpan' : 'Simpan story ini'}"
              aria-pressed="${isFavorite ? 'true' : 'false'}"
            >
              <i class="${isFavorite ? 'fas' : 'far'} fa-bookmark"></i>
            </button>
          </div>
          <time class="story-card-date" datetime="${story.createdAt}">
            <i class="fas fa-calendar-alt"></i> ${dateStr}
          </time>
          <p class="story-card-desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${story.description}</p>
          <div class="story-card-actions" style="margin-top: auto;">
            <a href="#/detail/${story.id}" class="btn btn-sm btn-block" style="width: 100%;">
              Lihat Detail
            </a>
          </div>
        </div>
      </article>
    `;
  }
}
