import api from '../axios';

// Get all fee assignments with optional search
export const fetchFeeAssignments = (search = '') => {
  const params = {};
  if (search) {
    params.search = search;
  }
  return api.get('/fee-assignments', { params });
};

// Get available grades for fee assignment
export const fetchGrades = () => api.get('/fee-assignments/grades');

// Create fee assignments for a specific grade
export const createGradeAssignment = (data) => api.post('/fee-assignments/grade', data);

// Update an individual fee assignment
export const updateFeeAssignment = (id, data) => api.put(`/fee-assignments/${id}`, data);

// Delete a fee assignment
export const deleteFeeAssignment = (id) => api.delete(`/fee-assignments/${id}`);

// Get specific fee assignment by ID
export const fetchFeeAssignment = (id) => api.get(`/fee-assignments/${id}`);
