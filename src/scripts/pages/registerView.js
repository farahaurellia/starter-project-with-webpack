class RegisterView {
  constructor() {
    this.appContainer = document.createElement('div');
  }

  render() {
    this.appContainer.innerHTML = `
      <div class="auth-container">
        <h1 class="auth-title">Register</h1>
        <form id="registerForm" class="auth-form">
          <input type="text" id="name" placeholder="Name" required class="auth-input">
          <input type="email" id="email" placeholder="Email" required class="auth-input">
          <input type="password" id="password" placeholder="Password" required class="auth-input">
          <button type="submit" class="auth-btn">Register</button>
          <p id="errorMessage" class="auth-error"></p>
        </form>
      </div>
    `;
    this.form = this.appContainer.querySelector('#registerForm');
    this.nameInput = this.appContainer.querySelector('#name');
    this.emailInput = this.appContainer.querySelector('#email');
    this.passwordInput = this.appContainer.querySelector('#password');
    this.errorMessage = this.appContainer.querySelector('#errorMessage');

    return this.appContainer; 
  }

  setPresenter(presenter) {
    this.presenter = presenter;
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = this.nameInput.value;
      const email = this.emailInput.value;
      const password = this.passwordInput.value;
      this.presenter.handleRegister(name, email, password);
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

export default RegisterView;
