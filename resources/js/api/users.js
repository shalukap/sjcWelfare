import api from '../axios';

export const login = (payload) => api.post('/login', payload);
export const logout = () => api.post('/logout');
export const getCurrentUser = () => api.get('/user');

export const fetchUsers = (page = 1) => api.get(`/users?page=${page}`);
export const fetchUser = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export const fetchRoles = () => api.get('/roles');