import HomePresenter from './home-presenter.js';
import { mapHelper } from '../../utils/map-helper.js';

export default class HomePage {
  #presenter;

  async render() {
    return `
      <div class="view-container">
        <h2 class="content-title">
          <i class="fas fa-book-open"></i> Dashboard Stories
        </h2>

        <!-- Peta interaktif dengan layer control -->
        <div
          class="map-container"
          id="story-map"
          tabindex="0"
          aria-label="Peta lokasi cerita di seluruh dunia"
          role="application"
        ></div>

        <!-- Loader -->
        <div id="loader" class="loader"></div>

        <!-- Daftar story -->
        <div id="story-list" class="container" style="margin-top: 32px; display: none;"></div>
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

  showStories(stories) {
    const container = document.getElementById('story-list');
    container.innerHTML = stories.map((s) => this.#createStoryCard(s)).join('');
    container.style.display = 'grid';
  }

  initMap(center) {
    mapHelper.initMap('story-map', center, true);
  }

  addMapMarkers(stories) {
    mapHelper.addMarkers(stories);
  }

  getMapMarkers() {
    return mapHelper.markers;
  }

  focusMapMarker(marker) {
    mapHelper.map.setView(marker.getLatLng(), 13, { animate: true });
    marker.openPopup();
    document.getElementById('story-map').scrollIntoView({ behavior: 'smooth' });
  }

  bindStoryCardClick(handler) {
    const cards = document.querySelectorAll('.story-card');
    cards.forEach((card, index) => {
      card.addEventListener('click', () => handler(index));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handler(index);
        }
      });
    });
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  #createStoryCard(story) {
    const defaultImg = 'https://placehold.co/400x200?text=No+Image';
    const imgUrl = story.photoUrl || defaultImg;
    const dateStr = new Date(story.createdAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <article class="story-card" tabindex="0" aria-label="Story dari ${story.name}">
        <img src="${imgUrl}" alt="Foto yang dibagikan oleh ${story.name}" loading="lazy">
        <div class="story-card-body">
          <h3 class="story-card-title">
            <i class="fas fa-user-circle"></i> ${story.name}
          </h3>
          <time class="story-card-date" datetime="${story.createdAt}">
            <i class="fas fa-calendar-alt"></i> ${dateStr}
          </time>
          <p class="story-card-desc">${story.description}</p>
        </div>
      </article>
    `;
  }
}
