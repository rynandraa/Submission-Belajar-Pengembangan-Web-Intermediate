export class AddStoryView {
  render() {
    return `
      <div class="view-container">
        <h2 class="content-title text-center">Add New Story</h2>
        
        <div class="auth-wrapper" style="max-width: 800px;">
          <div id="add-story-msg" class="invalid-feedback mb-2" style="display:none; text-align:center;"></div>
          
          <form id="add-story-form">
            <div class="form-row">
              <!-- Left side: Description and Map -->
              <div class="form-col">
                <div class="form-group">
                  <label for="description">Story Description</label>
                  <textarea id="description" class="form-control" rows="4" placeholder="How was your day?" required></textarea>
                </div>
                
                <div class="form-group">
                  <label>Select Location (Optional)</label>
                  <small style="display:block; margin-bottom:8px; color:var(--secondary-text);">Click the map to select koordinat.</small>
                  <div class="map-container" id="picker-map" style="height: 250px;" tabindex="0" aria-label="Map for choosing location"></div>
                  <div class="mt-2 text-sm" style="margin-top: 8px;">
                    <span id="lat-val">Lat: -</span>, <span id="lon-val">Lon: -</span>
                  </div>
                  <input type="hidden" id="lat" />
                  <input type="hidden" id="lon" />
                </div>
              </div>

              <!-- Right side: Photo and Camera -->
              <div class="form-col">
                 <div class="form-group">
                  <label for="photo">Upload Photo</label>
                  <input type="file" id="photo" class="form-control" accept="image/*" />
                </div>
                
                <div style="text-align:center; margin: 16px 0;"><strong>OR</strong></div>

                <div class="form-group">
                  <label>Use Camera</label>
                  <div style="display:flex; gap:8px; margin-bottom: 8px;">
                    <button type="button" id="start-cam-btn" class="btn" style="flex:1;">Start Camera</button>
                    <button type="button" id="stop-cam-btn" class="btn btn-danger" style="flex:1; display:none;">Stop</button>
                    <button type="button" id="take-photo-btn" class="btn" style="flex:1; display:none; background-color: #10b981;">Snapshot</button>
                  </div>
                  
                  <div style="background:var(--bg-color); border:1px solid var(--border-color); border-radius:var(--radius); overflow:hidden;">
                    <video id="camera-video" style="width: 100%; height: auto; display:none;" autoplay playsinline></video>
                    <canvas id="camera-canvas" style="display:none; width:100%; height:auto;"></canvas>
                  </div>
                  <small id="cam-status" style="display:block; margin-top:8px; color:var(--secondary-text);"></small>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <button type="submit" id="add-story-submit" class="btn" style="padding: 12px 32px; font-size: 1.1rem;">Post Story</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
