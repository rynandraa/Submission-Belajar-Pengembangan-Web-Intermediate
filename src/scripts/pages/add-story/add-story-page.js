import { AddStoryView } from './add-story-view.js';
import { StoryApi } from '../../data/api.js';
import { sessionHelper } from '../../utils/session-storage.js';
import { mapHelper } from '../../utils/map-helper.js';
import { cameraHelper } from '../../utils/camera-helper.js';

export default class AddStoryPage {
  constructor() {
    this.view = new AddStoryView();
    this.cameraBlob = null;
  }

  async render() {
    if (!sessionHelper.isLoggedIn()) {
      window.location.hash = '#/login';
      return '';
    }
    return this.view.render();
  }

  async afterRender() {
    if (!sessionHelper.isLoggedIn()) return;

    setTimeout(() => {
      mapHelper.initMap('picker-map', [-6.2, 106.816666], false);
      mapHelper.enableClickSelection((lat, lon) => {
        document.getElementById('lat').value = lat;
        document.getElementById('lon').value = lon;
        document.getElementById('lat-val').textContent = `Lat: ${lat.toFixed(4)}`;
        document.getElementById('lon-val').textContent = `Lon: ${lon.toFixed(4)}`;
      });
    }, 100);

    const form = document.getElementById('add-story-form');
    const msgDiv = document.getElementById('add-story-msg');
    const submitBtn = document.getElementById('add-story-submit');

    const startCamBtn = document.getElementById('start-cam-btn');
    const stopCamBtn = document.getElementById('stop-cam-btn');
    const takePhotoBtn = document.getElementById('take-photo-btn');
    const videoObj = document.getElementById('camera-video');
    const canvasObj = document.getElementById('camera-canvas');
    const fileInput = document.getElementById('photo');

    // Simpan teks asli tombol agar bisa direset
    const originalStartBtnText = startCamBtn.textContent;

    startCamBtn.addEventListener('click', async () => {
      try {
        await cameraHelper.startCamera('camera-video');
        videoObj.style.display = 'block';
        canvasObj.style.display = 'none';
        startCamBtn.style.display = 'none';
        stopCamBtn.style.display = 'block';
        takePhotoBtn.style.display = 'block';
        document.getElementById('cam-status').textContent = 'Camera active. Frame your shot!';
        this.cameraBlob = null;
      } catch (err) {
        alert(err.message || 'Cannot access camera.');
      }
    });

    stopCamBtn.addEventListener('click', () => {
      cameraHelper.stopCamera();
      videoObj.style.display = 'none';
      canvasObj.style.display = 'none'; // Sembunyikan canvas juga saat stop
      startCamBtn.style.display = 'block';
      startCamBtn.textContent = originalStartBtnText; // FIX Bug 2: reset teks tombol
      stopCamBtn.style.display = 'none';
      takePhotoBtn.style.display = 'none';
      document.getElementById('cam-status').textContent = '';
    });

    takePhotoBtn.addEventListener('click', async () => {
      const blob = await cameraHelper.takePhoto('camera-canvas');
      if (blob) {
        this.cameraBlob = blob;
        cameraHelper.stopCamera();
        videoObj.style.display = 'none';
        canvasObj.style.display = 'block';
        takePhotoBtn.style.display = 'none';
        stopCamBtn.style.display = 'none';
        startCamBtn.style.display = 'block';
        startCamBtn.textContent = 'Retake Photo';
        fileInput.value = '';
        document.getElementById('cam-status').textContent =
          'Photo captured successfully! You can post now or retake.';
      }
    });

    fileInput.addEventListener('change', () => {
      // FIX Bug 3: Hentikan kamera jika masih aktif
      cameraHelper.stopCamera();
      videoObj.style.display = 'none';
      stopCamBtn.style.display = 'none';
      takePhotoBtn.style.display = 'none';
      startCamBtn.style.display = 'block';
      startCamBtn.textContent = originalStartBtnText;

      this.cameraBlob = null;
      canvasObj.style.display = 'none';
      document.getElementById('cam-status').textContent = 'Using uploaded file.';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msgDiv.style.display = 'none';

      const description = document.getElementById('description').value;
      const lat = document.getElementById('lat').value;
      const lon = document.getElementById('lon').value;

      let finalFile = null;

      if (this.cameraBlob) {
        finalFile = new File([this.cameraBlob], 'camera_capture.jpg', { type: 'image/jpeg' });
      } else if (fileInput.files.length > 0) {
        finalFile = fileInput.files[0];
      }

      if (!finalFile) {
        msgDiv.textContent = 'Please provide a photo (Upload or Camera).';
        msgDiv.style.display = 'block';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Posting...';

      try {
        const response = await StoryApi.addStory(
          description,
          finalFile,
          lat ? parseFloat(lat) : null,
          lon ? parseFloat(lon) : null
        );

        if (!response.error) {
          // FIX Bug 1: Hentikan kamera sebelum navigasi
          cameraHelper.stopCamera();
          alert('Story successfully added!');
          window.location.hash = '#/';
        } else {
          msgDiv.textContent = response.message;
          msgDiv.style.display = 'block';
        }
      } catch (err) {
        msgDiv.textContent = 'Network Error. Failed to post story.';
        msgDiv.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Post Story';
      }
    });

    window.addEventListener(
      'hashchange',
      () => {
        cameraHelper.stopCamera();
      },
      { once: true }
    );
  }
}
