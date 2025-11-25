import api from '../axios';

export const createReport = (data) => api.post('/due-reports/generate', data);
export const getDues = () => api.get('/due-reports');