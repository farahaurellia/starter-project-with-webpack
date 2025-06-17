class LoginView {
  constructor() {
    this.appContainer = document.createElement('div');
  }

  render() {
    this.appContainer.innerHTML = `
      <div class="auth-container">
        <h1 class="auth-title">Login</h1>
        <form id="loginForm" class="auth-form">
          <input type="email" id="email" placeholder="Email" required class="auth-input">
          <input type="password" id="password" placeholder="Password" required class="auth-input">
          <button type="submit" class="auth-btn">Login</button>
          <p id="errorMessage" class="auth-error"></p>
        </form>
        <button id="logoutBtn" class="auth-logout-btn">Logout</button>
      </div>
    `;
    this.form = this.appContainer.querySelector('#loginForm');
    this.emailInput = this.appContainer.querySelector('#email');
    this.passwordInput = this.appContainer.querySelector('#password');
    this.errorMessage = this.appContainer.querySelector('#errorMessage');
    this.logoutBtn = this.appContainer.querySelector('#logoutBtn');

    // Event logout
    this.logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.hash = '/login';
      window.location.reload();
    });

    return this.appContainer; 
  }

  setPresenter(presenter) {
    this.presenter = presenter;
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = this.emailInput.value;
      const password = this.passwordInput.value;
      this.presenter.handleLogin(email, password);
    });
  }

  displayError(message) {
    this.errorMessage.textContent = message;
  }

  redirectToHomePage() {
    window.location.hash = '/';
    window.location.reload();
  }

  async afterRender() {
    // Kosongkan atau isi jika perlu aksi setelah render
  }
}

export default LoginView;
