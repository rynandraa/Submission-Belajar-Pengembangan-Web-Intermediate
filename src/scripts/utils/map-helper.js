export const mapHelper = {
  map: null,
  markers: [],

  initMap(containerId, initialCenter = [-6.2, 106.816666], layerControl = false) {
    if (this.map) {
      this.map.remove(); // Reset map if re-rendering
      this.map = null;
    }

    // Create base layers
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    });

    const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: '© OpenTopoMap',
    });

    this.map = L.map(containerId).setView(initialCenter, 10);
    osmLayer.addTo(this.map); // default layer

    if (layerControl) {
      const baseMaps = {
        'Street View (OSM)': osmLayer,
        Topographical: topoLayer,
      };
      L.control.layers(baseMaps).addTo(this.map);
    }
  },

  addMarkers(storiesArray) {
    this.markers.forEach((m) => m.remove());
    this.markers = [];

    storiesArray.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);
        const imgUrl = story.photoUrl || 'https://placehold.co/400x200?text=No+Image';
        marker.bindPopup(`
          <div style="font-family: inherit; text-align: center;">
            <b style="font-size:14px;">${story.name}</b><br>
            <img src="${imgUrl}" alt="Foto story oleh ${story.name}" style="width:100px; height:auto; border-radius:4px; margin: 8px 0;">
            ${story.id ? `<br><a href="#/detail/${story.id}" class="btn btn-sm" style="display:inline-block; margin-top:4px; padding: 6px 12px; text-decoration: none; font-size: 0.85rem; color: #ffffff !important;">Lihat Detail</a>` : ''}
          </div>
        `);
        this.markers.push(marker);
      }
    });

    // Fit bounds if we have markers
    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers);
      // PENTING: Tambahkan maxZoom agar tidak terlalu membesar (zoom in terlalu ekstrem) saat hanya ada 1 marker (seperti di Halaman Detail).
      this.map.fitBounds(group.getBounds(), { padding: [30, 30], maxZoom: 14 });
    }
  },

  enableClickSelection(callback) {
    let tempMarker = null;
    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (tempMarker) tempMarker.remove();
      tempMarker = L.marker([lat, lng]).addTo(this.map);
      callback(lat, lng);
    });
  },
};
