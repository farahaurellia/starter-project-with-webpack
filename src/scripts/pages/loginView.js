import Presenter from "../presenters/presenter";

class LoginView {
  constructor() {
    this.appContainer = document.createElement('div');
    this.presenter = null;  // Initialize presenter
    console.log('LoginView constructor dipanggil');
  }

  setPresenter(presenter) {
    console.log('Menetapkan Presenter ke LoginView (view)');
    this.presenter = presenter;  // Set the presenter
  }

  render() {
    console.log('LoginView render dipanggil');
    this.appContainer.innerHTML = `
      <div class="auth-container">
        <h1 class="auth-title">Login</h1>
        <form id="loginForm" class="auth-form">
          <input type="email" id="email" placeholder="Email" required class="auth-input">
          <input type="password" id="password" placeholder="Password" required class="auth-input">
          <button type="submit" class="auth-btn">Login</button>
          <p id="errorMessage" class="auth-error"></p>
        </form>
        <button id="logoutBtn" class="auth-logout-btn" >Logout</button>
      </div>
      <div id="successPopup" class="popup" style="display:none;">
        <p>Login Successful!</p>
      </div>
    `;

    this._initElements();  // Initialize form elements
    if (this.presenter) {
      console.log('Presenter sudah diinisialisasi');
      this._setupEventListeners();
    } else {
      console.error('Presenter belum diinisialisasi!');
    }
    this._checkAuthStatus();

    return this.appContainer;
  }

  _initElements() {
    this.form = this.appContainer.querySelector('#loginForm');
    this.emailInput = this.appContainer.querySelector('#email');
    this.passwordInput = this.appContainer.querySelector('#password');
    this.errorMessage = this.appContainer.querySelector('#errorMessage');
    this.logoutBtn = this.appContainer.querySelector('#logoutBtn');
    this.successPopup = this.appContainer.querySelector('#successPopup');
  }

  _setupEventListeners() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this._handleLogin();  // Call login method when the form is submitted
    });

    this.logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.hash = '/login';  // Redirect to login page
    });
  }

  _checkAuthStatus() {
    const token = localStorage.getItem('token');
    // if (token) {
    //   this.form.style.display = 'none';  // Hide the login form if token exists
    //   this.logoutBtn.style.display = 'block';  // Show logout button
    // }
  }

  async _handleLogin() {
    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value.trim();

    if (!email || !password) {
      this.displayError('Email dan password harus diisi');
      return;
    }

    try {
      if (!this.presenter) {
        console.error('Presenter belum diinisialisasi');
        throw new Error('Presenter belum diinisialisasi');
      }

      // Show loading state
      const submitBtn = this.form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memproses...';

      await this.presenter.handleLogin(email, password);  // Call handleLogin from the presenter

      // Show success popup
      this.showSuccessPopup();

      // Reset form after successful login
      this.form.reset();
    } catch (error) {
      console.error('Error saat login:', error);  // Log error
      this.displayError(error.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      // Reset loading state
      const submitBtn = this.form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      }
    }
  }

  showSuccessPopup() {
    this.successPopup.style.display = 'block';  // Show success popup
    setTimeout(() => {
      this.successPopup.style.display = 'none';  // Hide it after 3 seconds
    }, 3000);
  }

  displayError(message) {
    console.error('Error Message:', message);  // Log error message
    this.errorMessage.textContent = message;  // Display error message on UI
    setTimeout(() => {
      this.errorMessage.textContent = '';  // Remove error message after 5 seconds
    }, 5000);
  }

  redirectToHomePage() {
    window.location.hash = '/';  // Redirect to homepage after successful login
  }

  async afterRender() {
    // No special implementation after render
  }
}

export default LoginView;
