import { LoginView } from './login-view.js';
import { StoryApi } from '../../data/api.js';
import { sessionHelper } from '../../utils/session-storage.js';
import App from '../../app.js'; // To re-trigger initAuthUI manually or by just redirecting

export default class LoginPage {
  constructor() {
    this.view = new LoginView();
  }

  async render() {
    if (sessionHelper.isLoggedIn()) {
      window.location.hash = '#/';
      return '';
    }
    return this.view.render();
  }

  async afterRender() {
    if (sessionHelper.isLoggedIn()) return;

    const form = document.querySelector('#login-form');
    const msgDiv = document.querySelector('#login-message');
    const submitBtn = document.querySelector('#login-submit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msgDiv.style.display = 'none';
      const email = document.querySelector('#email').value;
      const pw = document.querySelector('#password').value;

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Logging in...';

      try {
        const response = await StoryApi.login(email, pw);
        if (!response.error) {
          sessionHelper.setToken(response.loginResult.token);
          // Force layout change since app is listening to hash but app is global, actually we just reload hash
          window.location.hash = '#/';
          // Small hack: dispatch hashchange to force app.renderPage without reload, or just simple UI init
          window.location.reload();
        } else {
          msgDiv.textContent = response.message;
          msgDiv.style.display = 'block';
        }
      } catch (err) {
        msgDiv.textContent = 'Network Error. Please try again.';
        msgDiv.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Login';
      }
    });
  }
}
