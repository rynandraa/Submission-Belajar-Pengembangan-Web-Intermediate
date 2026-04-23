import DetailPresenter from './detail-presenter.js';
import { mapHelper } from '../../utils/map-helper.js';

export default class DetailPage {
  #presenter;

  async render() {
    return `
      <div class="view-container">
        <!-- Breadcrumbs -->
        <nav aria-label="breadcrumb" class="breadcrumb-container" style="margin-bottom: 20px;">
          <a href="#/" class="breadcrumb-link"><i class="fas fa-home"></i> Home</a>
          <span class="breadcrumb-separator"><i class="fas fa-chevron-right"></i></span>
          <span class="breadcrumb-current" aria-current="page">Detail Story</span>
        </nav>

        <h1 class="content-title">
          <i class="fas fa-info-circle"></i> Detail Story
        </h1>

        <!-- Loader -->
        <div id="loader" class="loader"></div>

        <!-- Detail Container -->
        <div id="detail-container" class="detail-container" style="display: none;">
          <div class="detail-card" style="display: flex; border-radius: var(--radius); overflow: hidden; background: var(--bg-card); flex-wrap: wrap; box-shadow: var(--shadow-md); border: 1px solid var(--border-color);">
            
            <!-- Tambahkan pembatas (border-right) memisahkan kolom gambar dan info -->
            <div class="detail-image-container" style="padding: 24px; flex: 1 1 300px; max-width: 100%; border-right: 1px solid var(--border-color);">
              <h3 style="margin: 0 0 16px 0; font-size: 1.1rem; color: var(--secondary-text); border-bottom: 2px solid var(--primary-color); padding-bottom: 8px; display: inline-block;">
                <i class="fas fa-image"></i> Foto Upload
              </h3>
              <div style="border-radius: 12px; padding: 12px; background: #f8fafc;">
                <img id="detail-image" src="" alt="Story Image" loading="lazy" style="width: 100%; height: auto; border-radius: 6px; display: block; object-fit: contain; max-height: 500px; box-shadow: var(--shadow-sm);">
              </div>
            </div>
            
            <div class="detail-info-wrapper" style="flex: 1 1 350px; display: flex; flex-direction: column;">
              <div class="detail-info" style="padding: 24px; flex: 1;">
                <h3 style="margin: 0 0 16px 0; font-size: 1.1rem; color: var(--secondary-text); border-bottom: 2px solid var(--primary-color); padding-bottom: 8px; display: inline-block;">
                  <i class="fas fa-list-alt"></i> Informasi Detail
                </h3>
                <!-- Penanda kotak informasi diperjelas sedikit -->
                <div style="border-radius: 12px; padding: 24px; background-color: #ffffff; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                  <h3 class="detail-name" id="detail-name" style="margin-top: 0;">
                    <i class="fas fa-user-circle"></i> <span></span>
                  </h3>
                  <time class="detail-date" id="detail-date">
                    <i class="fas fa-calendar-alt"></i> <span></span>
                  </time>
                  <hr style="border: none; border-top: 1px solid var(--border-color); margin: 16px 0;">
                  <p class="detail-desc" id="detail-desc" style="margin: 0;"></p>
                </div>
              </div>
              
              <!-- Map Container for specific story -->
              <div id="detail-map-wrapper" style="display: none; padding: 0 24px 24px 24px;">
                <h3 style="margin: 0 0 16px 0; font-size: 1.1rem; color: var(--secondary-text); border-bottom: 2px solid var(--primary-color); padding-bottom: 8px; display: inline-block;">
                  <i class="fas fa-map-marker-alt"></i> Lokasi Peta
                </h3>
                <div
                  class="map-container"
                  id="detail-map"
                  tabindex="0"
                  aria-label="Peta lokasi spesifik cerita ini"
                  role="application"
                  style="height: 250px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;"
                ></div>
              </div>
            </div>

          </div>
        </div>
        
        <div class="action-container" style="margin-top: 24px;">
          <a href="#/" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Kembali</a>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this.#presenter = new DetailPresenter({ view: this });
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
    }).then(() => {
      this.navigateTo('#/');
    });
  }

  showDetail(story) {
    const container = document.getElementById('detail-container');
    const image = document.getElementById('detail-image');
    const name = document.querySelector('#detail-name span');
    const date = document.querySelector('#detail-date span');
    const desc = document.getElementById('detail-desc');
    const mapWrapper = document.getElementById('detail-map-wrapper');

    const defaultImg = 'https://placehold.co/400x200?text=No+Image';
    image.src = story.photoUrl || defaultImg;
    image.alt = `Foto oleh ${story.name}`;
    
    name.textContent = story.name;
    
    const dateStr = new Date(story.createdAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    date.textContent = dateStr;
    
    desc.textContent = story.description;
    
    container.style.display = 'block';

    if (story.lat !== null && story.lat !== undefined && story.lon !== null && story.lon !== undefined) {
      mapWrapper.style.display = 'block';
      setTimeout(() => {
        mapHelper.initMap('detail-map', [story.lat, story.lon], true);
        const markerInfo = {
          lat: story.lat,
          lon: story.lon,
          name: story.name,
          description: story.description
        };
        mapHelper.addMarkers([markerInfo]);
      }, 100);
    }
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }
}
