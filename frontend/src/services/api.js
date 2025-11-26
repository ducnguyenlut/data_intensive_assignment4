import axios from 'axios';

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

export const deleteEntity = async (entityType, id, options = {}) => {
  try {
    const params = {};
    if (options.cascade) {
      params.cascade = 'true';
    }
    if (options.reassignTo !== undefined) {
      params.reassignTo = options.reassignTo === null ? 'null' : options.reassignTo;
    }
    
    const response = await api.delete(`/${entityType}/${id}`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete entity');
  }
};

export const restoreData = async (target = 'all') => {
  try {
    const response = await axios.post(`${API_URL}/admin/restore`, { target });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to restore data');
  }
};

