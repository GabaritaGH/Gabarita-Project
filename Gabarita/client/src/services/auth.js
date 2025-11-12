import api from './api';

export async function registerUser(name, email, password) {
  const res = await api.post('/auth/signup', { name, email, password });
  return res.data;
}

export async function loginUser(email, password) {
  const res = await api.post('/auth/signin', { email, password });
  return res.data;
}

export async function logoutUser() {
  const res = await api.post('/auth/signout');
  return res.data;
}

export async function getSession() {
  const res = await api.get('/auth/session');
  return res.data;
}
