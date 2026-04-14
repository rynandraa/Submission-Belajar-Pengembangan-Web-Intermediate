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
        marker.bindPopup(`
          <div style="font-family: inherit;">
            <b style="font-size:14px;">${story.name}</b><br>
            <img src="${story.photoUrl}" alt="${story.name}" style="width:100px; height:auto; border-radius:4px; margin-top:8px;">
          </div>
        `);
        this.markers.push(marker);
      }
    });

    // Fit bounds if we have markers
    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds(), { padding: [20, 20] });
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
