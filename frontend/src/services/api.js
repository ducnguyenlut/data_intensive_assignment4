import axios from 'axios';

// For Docker, use backend service name; for local dev, use localhost
// Since frontend runs in browser, it should always use localhost:3001
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getEntities = async (entityType, view = 'all') => {
  try {
    const response = await api.get(`/${entityType}`, {
      params: { view }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch data');
  }
};

export const joinEntities = async (entityType) => {
  try {
    const response = await api.get(`/${entityType}/join`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to join data');
  }
};

export const createEntity = async (entityType, data) => {
  try {
    const response = await api.post(`/${entityType}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create entity');
  }
};

export const updateEntity = async (entityType, id, data) => {
  try {
    const response = await api.put(`/${entityType}/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update entity');
  }
};

export const deleteEntity = async (entityType, id) => {
  try {
    const response = await api.delete(`/${entityType}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete entity');
  }
};

