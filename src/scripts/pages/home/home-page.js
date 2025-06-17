import Model from '../../../models/model';

export default class HomePage {
  constructor() {
    this.appContainer = document.createElement('div');
    this.authModel = new Model();
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
      return;
    }

    try {
      const data = await this.authModel.getAllStories({
        page: 1,
        size: 10,
        location: 0,
        token,
      });

      if (data.error) {
        storiesList.innerHTML = `<p>${data.message || 'Gagal memuat stories.'}</p>`;
        return;
      }

      if (!data.listStory || data.listStory.length === 0) {
        storiesList.innerHTML = '<p>Tidak ada stories.</p>';
        return;
      }

      const storiesHtml = data.listStory.map((story, idx) => `
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

      data.listStory.forEach((story, idx) => {
        const storyDiv = storiesList.querySelector(`[data-story-id="${story.id}"]`);
        if (storyDiv) {
          storyDiv.addEventListener('click', () => {
            window.location.hash = `/stories/${story.id}`;
          });
          storyDiv.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              window.location.hash = `/stories/${story.id}`;
            }
          });
        }
        if (story.lat && story.lon) {
          const mapId = `map-${idx}`;
          // Pastikan map container sudah ada di DOM
          setTimeout(() => {
            const mapDiv = document.getElementById(mapId);
            if (mapDiv && !mapDiv._leaflet_id) { // Cegah double init
              const map = L.map(mapId).setView([story.lat, story.lon], 13);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
              }).addTo(map);
              L.marker([story.lat, story.lon]).addTo(map);
            }
          }, 0);
        }
      });
    } catch (err) {
      storiesList.innerHTML = `<p>Terjadi kesalahan saat memuat stories.<br>${err.message || ''}</p>`;
    }

    return this.appContainer; 
  }

  async afterRender() {
    // 
  }
}
