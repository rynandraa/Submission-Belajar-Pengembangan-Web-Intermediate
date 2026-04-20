import HomePage from '../pages/home/home-page.js';
import LoginPage from '../pages/auth/login/login-page.js';
import RegisterPage from '../pages/auth/register/register-page.js';
import AddStoryPage from '../pages/add-story/add-story-page.js';

const routes = {
  '/': () => new HomePage(),
  '/login': () => new LoginPage(),
  '/register': () => new RegisterPage(),
  '/add-story': () => new AddStoryPage(),
};

export default routes;
