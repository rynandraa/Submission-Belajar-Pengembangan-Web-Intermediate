import App from './app.js';
import '../styles/styles.css';
import '../styles/view-transitions.css';
import '../styles/responsive.css';

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.querySelector('#content');
  const app = new App({ content });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
