export class HomeView {
  render() {
    return `
      <div class="view-container">
        <h2 class="content-title">Dashboard Stories</h2>
        
        <!-- Accessible map container with multiple tile layout -->
        <div class="map-container" id="story-map" tabindex="0" aria-label="Peta lokasi cerita diseluruh dunia" role="application"></div>
        
        <div id="loader" class="loader"></div>
        
        <div id="error-message" class="invalid-feedback text-center mt-3" style="font-size: 1rem;"></div>
        
        <div id="story-list" class="container" style="margin-top: 32px; display: none;"></div>
      </div>
    `;
  }
}
