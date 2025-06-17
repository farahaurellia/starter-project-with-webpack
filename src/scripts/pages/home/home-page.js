import Model from '../../../models/model';

export default class HomePage {
  constructor() {
    this.appContainer = document.createElement('div');
    this.authModel = new Model();
    this.storiesData = null; // Menyimpan data stories
  }

  async render() {
    this.appContainer.innerHTML = `
      <main>
        <h1>Beranda</h1>
        <section id="stories-list" style="display: flex; flex-wrap: wrap; gap: 24px;" aria-label="Daftar Stories">
          <p>Memuat stories...</p>
        </section>
      </main>
    `;

    const storiesList = this.appContainer.querySelector('#stories-list');
    const token = localStorage.getItem('token');
    
    if (!token) {
      storiesList.innerHTML = '<p>Anda belum login.</p>';
      return this.appContainer; // Pastikan selalu return Node
    }

    try {
      this.storiesData = await this.authModel.getAllStories({
        page: 1,
        size: 10,
        location: 0,
        token,
      });

      if (this.storiesData.error) {
        storiesList.innerHTML = `<p>${this.storiesData.message || 'Gagal memuat stories.'}</p>`;
        return this.appContainer;
      }

      if (!this.storiesData.listStory || this.storiesData.listStory.length === 0) {
        storiesList.innerHTML = '<p>Tidak ada stories.</p>';
        return this.appContainer;
      }

      const storiesHtml = this.storiesData.listStory.map((story, idx) => `
        <article class="story-card" tabindex="0" data-story-id="${story.id}" aria-label="Story oleh ${story.name}">
          <figure>
            <img src="${story.photoUrl}" 
                 alt="Foto oleh ${story.name}" 
                 onerror="this.onerror=null;this.src='https://via.placeholder.com/220x140?text=No+Image';">
            <figcaption>${story.name}</figcaption>
          </figure>
          <p>${story.description || ''}</p>
          <small>${new Date(story.createdAt).toLocaleString()}</small>
          ${
            story.lat && story.lon
              ? `<div id="map-${idx}" class="story-map"></div>`
              : ''
          }
        </article>
      `).join('');
      
      storiesList.innerHTML = storiesHtml;

    } catch (err) {
      storiesList.innerHTML = `<p>Terjadi kesalahan saat memuat stories.<br>${err.message || ''}</p>`;
    }

    return this.appContainer; // Pastikan selalu return Node
  }

  async afterRender() {
    if (!this.storiesData?.listStory) return;

    // Add event listeners
    const storyCards = this.appContainer.querySelectorAll('[data-story-id]');
    storyCards.forEach((card) => {
      card.addEventListener('click', () => {
        const storyId = card.dataset.storyId;
        window.location.hash = `/stories/${storyId}`;
      });
      
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const storyId = card.dataset.storyId;
          window.location.hash = `/stories/${storyId}`;
        }
      });
    });

    // Initialize maps
    this.storiesData.listStory.forEach((story, idx) => {
      if (story.lat && story.lon) {
        const mapId = `map-${idx}`;
        const mapDiv = document.getElementById(mapId);
        if (mapDiv && !mapDiv._leaflet_id) {
          const map = L.map(mapId).setView([story.lat, story.lon], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          L.marker([story.lat, story.lon]).addTo(map);
        }
      }
    });
  }
}