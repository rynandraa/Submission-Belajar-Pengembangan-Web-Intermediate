import AddStoryPresenter from './add-story-presenter.js';
import { mapHelper } from '../../utils/map-helper.js';
import { cameraHelper } from '../../utils/camera-helper.js';

export default class AddStoryPage {
  #presenter;
  #cameraBlob = null;

  async render() {
    return `
      <div class="view-container">
        <!-- Breadcrumbs -->
        <nav aria-label="breadcrumb" class="breadcrumb-container" style="margin-bottom: 20px;">
          <a href="#/" class="breadcrumb-link"><i class="fas fa-home"></i> Home</a>
          <span class="breadcrumb-separator"><i class="fas fa-chevron-right"></i></span>
          <span class="breadcrumb-current" aria-current="page">Tambah Story</span>
        </nav>

        <h1 class="content-title text-center">
          <i class="fas fa-plus-circle"></i> Tambah Story Baru
        </h1>


        <div class="auth-wrapper" style="max-width: 860px;">
          <form id="add-story-form" novalidate>
            <div class="form-row">

              <!-- Kiri: Deskripsi & Peta -->
              <div class="form-col">
                <div class="form-group">
                  <label for="description">
                    <i class="fas fa-align-left"></i> Deskripsi Story
                  </label>
                  <textarea
                    id="description"
                    class="form-control"
                    rows="4"
                    placeholder="Ceritakan pengalamanmu hari ini..."
                    required
                  ></textarea>
                </div>

                <div class="form-group">
                  <label>
                    <i class="fas fa-map-marker-alt"></i> Pilih Lokasi
                    <span class="badge-optional">Opsional</span>
                  </label>
                  <small class="form-hint">Klik pada peta untuk menandai lokasi story Anda.</small>
                  <div
                    class="map-container"
                    id="picker-map"
                    style="height: 260px;"
                    tabindex="0"
                    aria-label="Peta untuk memilih lokasi story"
                  ></div>
                  <div class="coord-display">
                    <span id="lat-val"><i class="fas fa-crosshairs"></i> Lat: -</span>
                    <span id="lon-val">Lon: -</span>
                  </div>
                  <input type="hidden" id="lat" />
                  <input type="hidden" id="lon" />
                </div>
              </div>

              <!-- Kanan: Foto & Kamera -->
              <div class="form-col">
                <div class="form-group">
                  <label for="photo">
                    <i class="fas fa-upload"></i> Upload Foto
                  </label>
                  <input type="file" id="photo" class="form-control" accept="image/*" />
                </div>

                <div class="or-divider"><span>ATAU</span></div>

                <div class="form-group">
                  <label><i class="fas fa-camera"></i> Gunakan Kamera</label>
                  <div class="camera-controls">
                    <button type="button" id="start-cam-btn" class="btn btn-sm">
                      <i class="fas fa-video"></i> Buka Kamera
                    </button>
                    <button type="button" id="stop-cam-btn" class="btn btn-sm btn-danger" style="display:none;">
                      <i class="fas fa-stop"></i> Hentikan
                    </button>
                    <button type="button" id="take-photo-btn" class="btn btn-sm btn-success" style="display:none;">
                      <i class="fas fa-camera"></i> Ambil Foto
                    </button>
                  </div>

                  <div class="camera-preview-box">
                    <video
                      id="camera-video"
                      style="width: 100%; height: auto; display:none;"
                      autoplay
                      playsinline
                      aria-label="Preview kamera"
                    ></video>
                    <canvas
                      id="camera-canvas"
                      style="display:none; width:100%; height:auto;"
                      aria-label="Foto yang diambil"
                    ></canvas>
                    <div id="camera-placeholder" class="camera-placeholder">
                      <i class="fas fa-camera fa-2x"></i>
                      <p>Preview kamera akan muncul di sini</p>
                    </div>
                  </div>
                  <small id="cam-status" class="form-hint"></small>
                </div>
              </div>

            </div><!-- end .form-row -->

            <div style="text-align: center; margin-top: 28px;">
              <button type="submit" id="add-story-submit" class="btn" style="padding: 12px 40px; font-size: 1rem;">
                <i class="fas fa-paper-plane"></i> Post Story
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this.#presenter = new AddStoryPresenter({ view: this });
    await this.#presenter.initialize();
  }

  // ── View Methods: Peta ───────────────────────────────────────────────────

  initPickerMap() {
    setTimeout(() => {
      mapHelper.initMap('picker-map', [-6.2, 106.816666], false);
      mapHelper.enableClickSelection((lat, lon) => {
        this.#updateCoordinates(lat, lon);
      });
    }, 100);
  }

  #updateCoordinates(lat, lon) {
    document.getElementById('lat').value = lat;
    document.getElementById('lon').value = lon;
    document.getElementById('lat-val').innerHTML = `<i class="fas fa-crosshairs"></i> Lat: ${lat.toFixed(4)}`;
    document.getElementById('lon-val').textContent = `Lon: ${lon.toFixed(4)}`;
  }

  // ── View Methods: Kamera ─────────────────────────────────────────────────

  setupCamera() {
    const startBtn = document.getElementById('start-cam-btn');
    const stopBtn = document.getElementById('stop-cam-btn');
    const photoBtn = document.getElementById('take-photo-btn');
    const videoEl = document.getElementById('camera-video');
    const canvasEl = document.getElementById('camera-canvas');
    const placeholder = document.getElementById('camera-placeholder');
    const fileInput = document.getElementById('photo');
    const originalBtnText = startBtn.innerHTML;

    startBtn.addEventListener('click', async () => {
      try {
        await cameraHelper.startCamera('camera-video');
        videoEl.style.display = 'block';
        canvasEl.style.display = 'none';
        placeholder.style.display = 'none';
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-flex';
        photoBtn.style.display = 'inline-flex';
        this.#setCamStatus('Kamera aktif. Atur sudut pandang Anda!');
        this.#cameraBlob = null;
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Akses Kamera Gagal',
          text: err.message || 'Tidak dapat mengakses kamera.',
          confirmButtonColor: '#4f46e5',
        });
      }
    });

    stopBtn.addEventListener('click', () => {
      cameraHelper.stopCamera();
      videoEl.style.display = 'none';
      canvasEl.style.display = 'none';
      placeholder.style.display = 'flex';
      startBtn.style.display = 'inline-flex';
      startBtn.innerHTML = originalBtnText;
      stopBtn.style.display = 'none';
      photoBtn.style.display = 'none';
      this.#setCamStatus('');
    });

    photoBtn.addEventListener('click', async () => {
      const blob = await cameraHelper.takePhoto('camera-canvas');
      if (blob) {
        this.#cameraBlob = blob;
        cameraHelper.stopCamera();
        videoEl.style.display = 'none';
        canvasEl.style.display = 'block';
        placeholder.style.display = 'none';
        photoBtn.style.display = 'none';
        stopBtn.style.display = 'none';
        startBtn.style.display = 'inline-flex';
        startBtn.innerHTML = '<i class="fas fa-redo"></i> Ambil Ulang';
        fileInput.value = '';
        this.#setCamStatus('✅ Foto berhasil diambil! Klik "Post Story" untuk mengirim.');
      }
    });

    fileInput.addEventListener('change', () => {
      cameraHelper.stopCamera();
      videoEl.style.display = 'none';
      canvasEl.style.display = 'none';
      placeholder.style.display = 'flex';
      stopBtn.style.display = 'none';
      photoBtn.style.display = 'none';
      startBtn.style.display = 'inline-flex';
      startBtn.innerHTML = originalBtnText;
      this.#cameraBlob = null;
      this.#setCamStatus('Menggunakan file yang diunggah.');
    });

    window.addEventListener('hashchange', () => cameraHelper.stopCamera(), { once: true });
  }

  stopCamera() {
    cameraHelper.stopCamera();
  }

  #setCamStatus(text) {
    document.getElementById('cam-status').textContent = text;
  }

  // ── View Methods: Form ───────────────────────────────────────────────────

  getPhotoFile() {
    if (this.#cameraBlob) {
      return new File([this.#cameraBlob], 'camera_capture.jpg', { type: 'image/jpeg' });
    }
    const fileInput = document.getElementById('photo');
    return fileInput.files.length > 0 ? fileInput.files[0] : null;
  }

  getFormData() {
    return {
      description: document.getElementById('description').value.trim(),
      lat: document.getElementById('lat').value || null,
      lon: document.getElementById('lon').value || null,
    };
  }

  bindSubmit(handler) {
    document.getElementById('add-story-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await handler();
    });
  }

  // ── View Methods: Feedback ───────────────────────────────────────────────

  setLoading(isLoading) {
    const btn = document.getElementById('add-story-submit');
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
      ? '<i class="fas fa-spinner fa-spin"></i> Memposting...'
      : '<i class="fas fa-paper-plane"></i> Post Story';
  }

  showError(message) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Memposting',
      text: message,
      confirmButtonColor: '#4f46e5',
    });
  }

  async showSuccess(message) {
    return Swal.fire({
      icon: 'success',
      title: 'Story Berhasil Diposting! 🎉',
      text: message,
      timer: 2000,
      showConfirmButton: false,
    });
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }
}
