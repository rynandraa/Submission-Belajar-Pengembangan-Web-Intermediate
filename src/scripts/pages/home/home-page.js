import { HomeView } from './home-view.js';
import { StoryApi } from '../../data/api.js';
import { sessionHelper } from '../../utils/session-storage.js';
import { mapHelper } from '../../utils/map-helper.js';

export default class HomePage {
  constructor() {
    this.view = new HomeView();
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

    // Use a small timeout to let DOM render completely before Leaflet accesses the container width
    setTimeout(async () => {
      // 1. Init map with layer control for advanced map criteria
      mapHelper.initMap('story-map', [-6.2, 106.816666], true);

      const loader = document.getElementById('loader');
      const container = document.getElementById('story-list');
      const errorMsg = document.getElementById('error-message');

      try {
        const result = await StoryApi.getAllStories(1); // 1 = fetch with location
        loader.style.display = 'none';

        if (!result.error) {
          const stories = result.listStory;

          if (stories.length === 0) {
            container.innerHTML = '<p>No stories found.</p>';
          } else {
            // 2. Generate list
            const html = stories.map((s) => this.#createStoryCard(s)).join('');
            container.innerHTML = html;
            container.style.display = 'grid'; // because css grid

            // 3. Sync list and map (Map Interactivity Criteria)
            mapHelper.addMarkers(stories);
            const cards = document.querySelectorAll('.story-card');
            cards.forEach((card, index) => {
              const marker = mapHelper.markers[index];
              const triggerPopup = () => {
                mapHelper.map.setView(marker.getLatLng(), 13, { animate: true });
                marker.openPopup();
                // Optionally scroll to map for better UX in mobile
                document.getElementById('story-map').scrollIntoView({ behavior: 'smooth' });
              };

              card.addEventListener('click', triggerPopup);
              card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  triggerPopup();
                }
              });
            });
          }
        } else {
          errorMsg.textContent = result.message;
          errorMsg.style.display = 'block';
        }
      } catch (e) {
        loader.style.display = 'none';
        errorMsg.textContent = 'Failed to fetch dashboard content.';
        errorMsg.style.display = 'block';
      }
    }, 100);
  }

  #createStoryCard(story) {
    const defaultImg = 'https://via.placeholder.com/400x200?text=No+Image';
    const imgUrl = story.photoUrl ? story.photoUrl : defaultImg;
    const dateStr = new Date(story.createdAt).toLocaleDateString();

    return `
      <article class="story-card" tabindex="0">
        <img src="${imgUrl}" alt="Photo shared by ${story.name}">
        <div class="story-card-body">
          <h3 class="story-card-title">${story.name}</h3>
          <time class="story-card-date" datetime="${story.createdAt}">${dateStr}</time>
          <p class="story-card-desc">${story.description}</p>
        </div>
      </article>
    `;
  }
}
