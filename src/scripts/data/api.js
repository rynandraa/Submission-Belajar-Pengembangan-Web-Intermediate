import { sessionHelper } from '../utils/session-storage.js';

const BASE_URL = 'https://story-api.dicoding.dev/v1';

export const StoryApi = {
  async register(name, email, password) {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  async login(email, password) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async getAllStories(location = 1) {
    // 1 to include location
    const token = sessionHelper.getToken();
    const response = await fetch(`${BASE_URL}/stories?location=${location}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async addStory(description, photo, lat, lon) {
    const token = sessionHelper.getToken();
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat !== undefined && lon !== undefined && lat !== null && lon !== null) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    // Dicoding specification: Add guest form data if needed (it is authenticated API mostly so token should work)

    const response = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },
};
