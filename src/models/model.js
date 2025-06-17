class Model {
  constructor() {
    this.apiUrl = 'https://story-api.dicoding.dev/v1/';
  }

  // Fungsi untuk melakukan Register
  register(name, email, password) {
    return fetch(`${this.apiUrl}register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })
      .then((response) => response.json())
      .then((data) => data)
      .catch((error) => {
        throw new Error(error);
      });
  }

  // Fungsi untuk melakukan Login
    login(email, password) {
    return fetch(`${this.apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Login data:', data); // Log data untuk debug
      return data;
    })
    .catch(error => {
      console.error('Error during login:', error); // Log error untuk debug
      throw new Error('Login failed');
    });
  }



  // Fungsi untuk mengambil semua stories
  getAllStories({ page = 1, size = 10, location = 0, token }) {
    const url = `${this.apiUrl}stories?page=${page}&size=${size}&location=${location}`;
    return fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => data)
      .catch((error) => {
        throw new Error(error);
      });
  }

  // Fungsi untuk menambah story baru
  addStory({ description, photo, lat, lon, token }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    console.log('Adding story with data');
    if (lat !== undefined) formData.append('lat', lat);
    if (lon !== undefined) formData.append('lon', lon);

    // Gunakan endpoint dan headers sesuai ada/tidaknya token
    const url = token
      ? `${this.apiUrl}stories`
      : `${this.apiUrl}stories/guest`;

    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    return fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => data)
      .catch((error) => {
        throw new Error(error);
      });
  }

  // Fungsi untuk mengambil detail story
  getDetailStory({ id, token }) {
    const url = `${this.apiUrl}stories/${id}`;
    return fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => data)
      .catch((error) => {
        throw new Error(error);
      });
  }
}

export default Model;
