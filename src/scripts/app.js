import { getActiveRoute } from './routes/url-parser.js';
import routes from './routes/routes.js';
import { sessionHelper } from './utils/session-storage.js';

export default class App {
  #content;

  constructor({ content }) {
    this.#content = content;
    this.#initAuthUI();
  }

  async renderPage() {
    const routeName = getActiveRoute();
    const route = routes[routeName];

    if (!route) {
      this.#content.innerHTML = `<h2 class="content-title">Error 404 - Page Not Found</h2>`;
      return;
    }

    // Get presenter instance
    const page = route();

    // Document View Transitions
    if (!document.startViewTransition) {
      await this.#renderComponent(page);
    } else {
      document.startViewTransition(async () => {
        await this.#renderComponent(page);
      });
    }
  }

  async #renderComponent(page) {
    this.#content.innerHTML = await page.render();
    if (page.afterRender) {
      await page.afterRender();
    }
  }

  #initAuthUI() {
    const authRelated = document.querySelectorAll('.auth-related');
    const guestRelated = document.querySelectorAll('.guest-related');
    const logoutBtn = document.querySelector('#logout-btn');

    const isLoggedIn = sessionHelper.isLoggedIn();

    if (isLoggedIn) {
      authRelated.forEach((el) => el.classList.remove('d-none'));
      guestRelated.forEach((el) => el.classList.add('d-none'));
    } else {
      authRelated.forEach((el) => el.classList.add('d-none'));
      guestRelated.forEach((el) => el.classList.remove('d-none'));
    }

    if (logoutBtn && !logoutBtn.dataset.listenerAdded) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionHelper.removeToken();
        this.#initAuthUI();
        window.location.hash = '#/login';
      });
      logoutBtn.dataset.listenerAdded = 'true';
    }
  }
}
