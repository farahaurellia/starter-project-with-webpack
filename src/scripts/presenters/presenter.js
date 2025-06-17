import NotificationPopupView from '../pages/notificationView';

class Presenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    if (this.view && typeof this.view.setPresenter === 'function') {
      this.view.setPresenter(this);
    }
  }

  handleLogin(email, password) {
    this.model
      .login(email, password)
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
    // Ambil token dari parameter (dari view), bisa undefined/null jika guest
    // Guest user boleh menambah story tanpa login
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

  // Presenter untuk detail story
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
