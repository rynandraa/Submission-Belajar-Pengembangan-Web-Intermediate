import { RegisterView } from './register-view.js';
import { StoryApi } from '../../data/api.js';
import { sessionHelper } from '../../utils/session-storage.js';

export default class RegisterPage {
  constructor() {
    this.view = new RegisterView();
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

    const form = document.querySelector('#register-form');
    const msgDiv = document.querySelector('#register-message');
    const submitBtn = document.querySelector('#register-submit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msgDiv.style.display = 'none';
      const name = document.querySelector('#name').value;
      const email = document.querySelector('#email').value;
      const pw = document.querySelector('#password').value;

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Registering...';

      try {
        const response = await StoryApi.register(name, email, pw);
        if (!response.error) {
          // Success, now login directly or just redirect to login
          alert('Registration configmed! Please log in.');
          window.location.hash = '#/login';
        } else {
          msgDiv.textContent = response.message;
          msgDiv.style.display = 'block';
        }
      } catch (err) {
        msgDiv.textContent = 'Network Error. Please try again.';
        msgDiv.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Register';
      }
    });
  }
}
