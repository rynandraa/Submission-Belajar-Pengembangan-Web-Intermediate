export const cameraHelper = {
  stream: null,
  videoEl: null,

  async startCamera(videoElementId) {
    this.videoEl = document.getElementById(videoElementId);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API not supported on this browser.');
    }

    this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    this.videoEl.srcObject = this.stream;
    await this.videoEl.play();
  },

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoEl) {
      this.videoEl.srcObject = null;
    }
  },

  takePhoto(canvasElementId) {
    if (!this.videoEl || !this.stream) return null;

    const canvas = document.getElementById(canvasElementId);
    canvas.width = this.videoEl.videoWidth;
    canvas.height = this.videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.videoEl, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
  },
};
