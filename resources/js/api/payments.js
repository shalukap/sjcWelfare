import api from '../axios';

// Get all payments
export const fetchPayments = () => api.get('/payments');

// Get specific payment
export const fetchPayment = (id) => api.get(`/payments/${id}`);

// Create new payment
export const createPayment = (data) => api.post('/payments', data);

// Update payment
export const updatePayment = (id, data) => api.put(`/payments/${id}`, data);

// Delete payment
export const deletePayment = (id) => api.delete(`/payments/${id}`);

// Cancel payment
export const cancelPayment = (id, reason) => api.post(`/payments/${id}/cancel`, { cancellation_reason: reason });

// Search students
export const searchStudents = (query, grade = '', classParam = '') =>
  api.get(`/payments/search-students?q=${query}&grade=${grade}&class=${classParam}`);

// Search student assignments
export const searchStudentAssignments = (admissionNumber) =>
  api.get(`/payments/search-student-assignments?admission_number=${admissionNumber}`);

// Get student assignments
export const getStudentAssignments = (studentId) =>
  api.get(`/payments/student-assignments/${studentId}`);

// Generate PDF
export const generatePDF = () => api.get('/payments/generate-pdf');
