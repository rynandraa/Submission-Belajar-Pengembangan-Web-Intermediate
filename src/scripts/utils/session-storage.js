const SESSION_TOKEN_KEY = 'DICODING_STORY_TOKEN';

export const sessionHelper = {
  setToken(token) {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  },
  getToken() {
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  },
  removeToken() {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  },
  isLoggedIn() {
    return !!sessionStorage.getItem(SESSION_TOKEN_KEY);
  },
};
