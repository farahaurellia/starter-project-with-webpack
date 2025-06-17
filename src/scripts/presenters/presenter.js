import Model from '../../models/model.js';

class Presenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;

    console.log('Presenter constructor dipanggil');
    if (!this.model) {
      console.error('Model tidak diinisialisasi di Presenter');
    }

    if (this.view && typeof this.view.setPresenter === 'function') {
      this.view.setPresenter(this);  // Pastikan presenter diset ke view
    }else {
      console.error('Presenter gagal diset ke view');
    }
  }

  handleLogin(email, password) {
    console.log('handleLogin dipanggil dengan email:', email);  // Log untuk memverifikasi pemanggilan
    this.model
      .login(email, password)  // Panggil model untuk login
      .then(data => {
        if (data.error) {
          this.view.displayError(data.message);
        } else {
          if (data.loginResult && data.loginResult.token) {
            localStorage.setItem('token', data.loginResult.token); // Simpan token di localStorage
          }
          setTimeout(() => {
            this.view.redirectToHomePage();  // Redirect setelah login sukses
          }, 100);
        }
      })
      .catch(error => {
        console.error('Error saat login:', error);
        this.view.displayError(error.message || 'Login gagal. Silakan coba lagi.');
      });
  }

  handleRegister(name, email, password) {
    this.model
      .register(name, email, password)
      .then((data) => {
        if (data.error) {
          this.view.displayError(data.message);
        } else {
          if (data.loginResult && data.loginResult.token) {
            localStorage.setItem('token', data.loginResult.token);
          }
          setTimeout(() => {
            this.view.redirectToHomePage();
          }, 100);
        }
      })
      .catch((error) => {
        this.view.displayError(error.message);
      });
  }

  handleAddStory({ description, photo, lat, lon, token }) {
    if (!description || !photo) {
      this.view.displayError('Deskripsi dan foto wajib diisi.');
      return;
    }

    this.model
      .addStory({ description, photo, lat, lon, token })
      .then((data) => {
        if (data.error) {
          this.view.displayError(data.message || 'Gagal menambah story.');
        } else {
          this.view.displaySuccess(data.message || 'Story berhasil ditambahkan!');
        }
      })
      .catch((error) => {
        this.view.displayError(error.message || 'Terjadi kesalahan.');
      });
  }

  handleGetDetailStory({ id }) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.view.displayError('Anda harus login untuk melihat detail story.');
      return;
    }
    this.model
      .getDetailStory({ id, token })
      .then((data) => {
        if (data.error) {
          this.view.displayError(data.message || 'Gagal memuat detail story.');
        } else {
          this.view.displayDetailStory(data.story);
        }
      })
      .catch((error) => {
        this.view.displayError(error.message || 'Terjadi kesalahan.');
      });
  }
}

export default Presenter;
