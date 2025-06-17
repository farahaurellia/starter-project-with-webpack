class AddStoryView {
  constructor() {
    this.appContainer = document.createElement('div');
    this.stream = null;
    this._onPageHide = this._onPageHide.bind(this);
  }

  render() {
    this.appContainer.innerHTML = `
      <h1>Tambah Story Baru</h1>
      <form id="addStoryForm" enctype="multipart/form-data">
        <div>
          <label for="description">Deskripsi:</label><br>
          <textarea id="description" name="description" rows="3" required></textarea>
        </div>
        <div>
          <label>Foto (max 1MB):</label><br>
          <input type="file" id="photo" name="photo" accept="image/*" style="display:none">
          <button type="button" id="openCameraBtn">Ambil dari Kamera</button>
          <button type="button" id="chooseFileBtn">Pilih dari File</button>
          <div id="cameraContainer" style="display:none; margin-top:10px;">
            <video id="video" autoplay playsinline width="300" style="border-radius:8px;"></video><br>
            <button type="button" id="captureBtn">Ambil Foto</button>
            <button type="button" id="closeCameraBtn">Tutup Kamera</button>
            <canvas id="canvas" style="display:none;"></canvas>
          </div>
          <div id="previewContainer" style="margin-top:10px;"></div>
        </div>
        <div>
          <label for="lat">Latitude (otomatis dari peta):</label><br>
          <input type="number" id="lat" name="lat" step="any" readonly>
        </div>
        <div>
          <label for="lon">Longitude (otomatis dari peta):</label><br>
          <input type="number" id="lon" name="lon" step="any" readonly>
        </div>
        <div style="margin:16px 0;">
          <label>Pilih lokasi pada peta:</label>
          <div id="map-picker" style="height:250px;width:100%;border-radius:8px;overflow:hidden;"></div>
        </div>
        <button type="submit">Tambah Story</button>
        <p id="errorMessage" style="color: red;"></p>
        <p id="successMessage" style="color: green;"></p>
      </form>
    `;

    this.form = this.appContainer.querySelector('#addStoryForm');
    this.descriptionInput = this.appContainer.querySelector('#description');
    this.photoInput = this.appContainer.querySelector('#photo');
    this.latInput = this.appContainer.querySelector('#lat');
    this.lonInput = this.appContainer.querySelector('#lon');
    this.errorMessage = this.appContainer.querySelector('#errorMessage');
    this.successMessage = this.appContainer.querySelector('#successMessage');
    this.mapPickerDiv = this.appContainer.querySelector('#map-picker');
    this.openCameraBtn = this.appContainer.querySelector('#openCameraBtn');
    this.chooseFileBtn = this.appContainer.querySelector('#chooseFileBtn');
    this.cameraContainer = this.appContainer.querySelector('#cameraContainer');
    this.video = this.appContainer.querySelector('#video');
    this.captureBtn = this.appContainer.querySelector('#captureBtn');
    this.closeCameraBtn = this.appContainer.querySelector('#closeCameraBtn');
    this.canvas = this.appContainer.querySelector('#canvas');
    this.previewContainer = this.appContainer.querySelector('#previewContainer');

    // Event untuk buka kamera
    this.openCameraBtn.addEventListener('click', async () => {
      this.cameraContainer.style.display = 'block';
      this.previewContainer.innerHTML = '';
      try {
        // Minta akses kamera ke user
        this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        this.video.srcObject = this.stream;
      } catch (err) {
        this.displayError('Izin akses kamera ditolak atau tidak tersedia.');
        this.cameraContainer.style.display = 'none';
      }
    });

    // Event untuk tutup kamera (tombol)
    this.closeCameraBtn.addEventListener('click', () => {
      this.cameraContainer.style.display = 'none';
      this.stopCamera();
    });

    // Event untuk ambil foto dari kamera
    this.captureBtn.addEventListener('click', () => {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.canvas.getContext('2d').drawImage(this.video, 0, 0);
      this.canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          this.photoInput.files = this.fileListFromFile(file);
          this.previewContainer.innerHTML = `<img src="${URL.createObjectURL(blob)}" style="max-width:200px;border-radius:8px;">`;
        }
      }, 'image/jpeg', 0.9);
      this.cameraContainer.style.display = 'none';
      this.stopCamera();
    });

    // Event untuk pilih file dari galeri
    this.chooseFileBtn.addEventListener('click', () => {
      this.photoInput.click();
    });

    // Preview jika pilih file dari galeri
    this.photoInput.addEventListener('change', () => {
      if (this.photoInput.files && this.photoInput.files[0]) {
        const url = URL.createObjectURL(this.photoInput.files[0]);
        this.previewContainer.innerHTML = `<img src="${url}" style="max-width:200px;border-radius:8px;">`;
      }
    });

    // Tutup kamera otomatis saat pindah halaman
    window.addEventListener('hashchange', this._onPageHide);
    window.addEventListener('beforeunload', this._onPageHide);

    return this.appContainer;
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
  }

  _onPageHide() {
    this.stopCamera();
    if (this.cameraContainer) {
      this.cameraContainer.style.display = 'none';
    }
    // Hapus event listener agar tidak leak
    window.removeEventListener('hashchange', this._onPageHide);
    window.removeEventListener('beforeunload', this._onPageHide);
  }

  fileListFromFile(file) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    return dataTransfer.files;
  }

  async afterRender() {
    // Inisialisasi peta digital menggunakan Leaflet
    if (this.mapPickerDiv) {
      // Default ke Jakarta jika belum ada koordinat
      const defaultLat = -6.200000;
      const defaultLon = 106.816666;
      const map = L.map(this.mapPickerDiv).setView([defaultLat, defaultLon], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      let marker = null;

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        this.latInput.value = lat;
        this.lonInput.value = lng;

        // Reverse geocoding untuk dapatkan kota, provinsi
        let desc = '';
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || '';
          const state = data.address.state || '';
          desc = city && state ? `${city}, ${state}` : (city || state || 'Lokasi tidak diketahui');
        } catch {
          desc = 'Lokasi tidak diketahui';
        }

        if (marker) {
          marker.setLatLng([lat, lng]);
          marker.bindPopup(desc).openPopup();
        } else {
          marker = L.marker([lat, lng]).addTo(map);
          marker.bindPopup(desc).openPopup();
        }
      });
    }
  }

  setPresenter(presenter) {
    this.presenter = presenter;
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('Form submitted, handling add story...');
      const description = this.descriptionInput.value;
      const photo = this.photoInput.files[0];
      const lat = this.latInput.value ? parseFloat(this.latInput.value) : undefined;
      const lon = this.lonInput.value ? parseFloat(this.lonInput.value) : undefined;
      // Ambil token jika ada, jika tidak biarkan undefined (guest)
      const token = localStorage.getItem('token') || undefined;
      this.presenter.handleAddStory({ description, photo, lat, lon, token });
    });
  }

  displayError(message) {
    this.errorMessage.textContent = message;
    this.successMessage.textContent = '';
  }

  displaySuccess(message) {
    this.successMessage.textContent = message;
    this.errorMessage.textContent = '';
    this.form.reset();
    // Hapus marker dan input lat/lon setelah submit sukses jika perlu
    if (this.latInput) this.latInput.value = '';
    if (this.lonInput) this.lonInput.value = '';
  }
}

export default AddStoryView;