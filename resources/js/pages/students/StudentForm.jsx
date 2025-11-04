import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createStudent, updateStudent, fetchStudent } from '../../api/students';
import { success, error as swalError } from '../../utils/swal';

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    admission_number: '',
    name: '',
    whatsapp_number: '',
    current_grade: '',
    current_class: '',
    is_active: true,
    sibling_admission_no: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'A/L'];

  useEffect(() => {
    if (isEdit && id) {
      loadStudent();
    }
  }, [isEdit, id]);

  const loadStudent = async () => {
    try {
      const response = await fetchStudent(id);
      setFormData(response.data);
    } catch (error) {
      console.error('Failed to fetch student', error);
      swalError('Failed to load student data', 'Could not load student. Please try again.');
    }
  };

  const getClassOptions = (grade) => {
    if (grade === 'A/L') {
      return ['2025', '2026', '2027', '2028', '2029', '2030', '12X', '13X'];
    } else {
      const gradeNum = parseInt(grade);
      return [
        `${gradeNum}s1`, `${gradeNum}s2`, `${gradeNum}s3`, `${gradeNum}s4`, `${gradeNum}s5`, `${gradeNum}s6`,
        `${gradeNum}T`, `${gradeNum}X`
      ];
    }
  };

  const validateWhatsappNumber = (value) => {
    if (!value) return true; // Optional field
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(value);
  };

  const handleWhatsappInput = (value) => {
    const numericValue = value.replace(/\D/g, '');
    const truncatedValue = numericValue.slice(0, 10);
    setFormData(prev => ({ ...prev, whatsapp_number: truncatedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!validateWhatsappNumber(formData.whatsapp_number)) {
      setErrors({ whatsapp_number: 'WhatsApp number must be exactly 10 digits if provided' });
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await updateStudent(id, formData);
        await success('Student updated successfully!', '');
      } else {
        await createStudent(formData);
        await success('Student created successfully!', '');
      }
      navigate('/admin/students');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        swalError('Failed to save student', 'Please try again or check the form.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className="p-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-4xl rounded-xl bg-slate-800 p-8 text-white shadow-lg"
      >
        <h2 className="mb-6 text-center text-2xl font-semibold">
          {isEdit ? 'Edit Student' : 'Add New Student'}
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Admission Number *
            </label>
            <input
              type="text"
              placeholder="Enter Admission Number"
              required
              value={formData.admission_number}
              onChange={(e) => handleChange('admission_number', e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
              readOnly={isEdit}
            />
            {errors.admission_number && (
              <p className="mt-1 text-sm text-red-400">{errors.admission_number}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Name *</label>
            <input
              type="text"
              placeholder="Enter Student Name"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              WhatsApp Number
            </label>
            <input
              type="text"
              placeholder="0771234567"
              value={formData.whatsapp_number}
              onChange={(e) => handleWhatsappInput(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.whatsapp_number && (
              <p className="mt-1 text-sm text-red-400">{errors.whatsapp_number}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Sibling Admission Number
            </label>
            <input
              type="text"
              placeholder="Enter sibling's admission number (optional)"
              value={formData.sibling_admission_no}
              onChange={(e) => handleChange('sibling_admission_no', e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.sibling_admission_no && (
              <p className="mt-1 text-sm text-red-400">{errors.sibling_admission_no}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Current Grade *</label>
            <select
              required
              value={formData.current_grade}
              onChange={(e) => {
                handleChange('current_grade', e.target.value);
                handleChange('current_class', '');
              }}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Grade</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade === 'A/L' ? 'A/L' : `Grade ${grade}`}
                </option>
              ))}
            </select>
            {errors.current_grade && (
              <p className="mt-1 text-sm text-red-400">{errors.current_grade}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Current Class *</label>
            <select
              required
              value={formData.current_class}
              onChange={(e) => handleChange('current_class', e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
              disabled={!formData.current_grade}
            >
              <option value="">Select Class</option>
              {formData.current_grade && getClassOptions(formData.current_grade).map((classOption) => (
                <option key={classOption} value={classOption}>
                  {classOption}
                </option>
              ))}
            </select>
            {errors.current_class && (
              <p className="mt-1 text-sm text-red-400">{errors.current_class}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 bg-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-white">
              Active Status
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/admin/students"
            className="rounded-lg bg-gray-500 px-6 py-2 font-semibold text-white transition-all hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Student' : 'Add Student')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
