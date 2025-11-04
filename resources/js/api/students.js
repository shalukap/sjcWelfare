import api from '../axios';

// Fetch all students
export const fetchStudents = () => api.get('/students');

// Fetch a single student by ID
export const fetchStudent = (id) => api.get(`/students/${id}`);

// Create a new student
export const createStudent = (data) => api.post('/students', data);

// Update an existing student
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);

// Delete a student
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// Upgrade students to the next academic year
export const upgradeStudents = (academicYear) => api.post('/students/upgrade', { academic_year: academicYear });
