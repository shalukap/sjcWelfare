import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchGrades, createGradeAssignment } from '../../api/feeAssignments';
import Swal from 'sweetalert2';

const FeeAssignmentCreateGrade = () => {
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [formData, setFormData] = useState({
    academic_year: new Date().getFullYear().toString(),
    grade: '',
    assigned_fee: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      const response = await fetchGrades();
      setGrades(response.data);
    } catch (error) {
      console.error('Failed to fetch grades', error);
      Swal.fire('Error!', 'Failed to load grades', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await createGradeAssignment(formData);

      await Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Fee assignments created successfully!',
        showConfirmButton: false,
        timer: 1500
      });

      navigate('/admin/fee-assignments');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.error) {
        Swal.fire('Error!', error.response.data.error, 'error');
      } else {
        Swal.fire('Error!', 'Failed to create fee assignments', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className="h-full w-full overflow-x-auto p-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl rounded-xl bg-slate-800 p-8 text-white shadow-lg"
      >
        <h2 className="mb-6 text-center text-2xl font-semibold">Assign Fees to Grade</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="academic_year" className="mb-2 block text-sm font-medium">
              Academic Year
            </label>
            <input
              type="text"
              id="academic_year"
              value={formData.academic_year}
              onChange={(e) => handleChange('academic_year', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2024"
              required
            />
            {errors.academic_year && (
              <p className="mt-1 text-sm text-red-400">{errors.academic_year}</p>
            )}
          </div>

          <div>
            <label htmlFor="grade" className="mb-2 block text-sm font-medium">
              Grade
            </label>
            <select
              id="grade"
              value={formData.grade}
              onChange={(e) => handleChange('grade', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Grade</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            {errors.grade && (
              <p className="mt-1 text-sm text-red-400">{errors.grade}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="assigned_fee" className="mb-2 block text-sm font-medium">
              Assigned Fee (Rs.)
            </label>
            <input
              type="number"
              id="assigned_fee"
              value={formData.assigned_fee}
              onChange={(e) => handleChange('assigned_fee', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 3000"
              min="0"
              step="0.01"
              required
            />
            {errors.assigned_fee && (
              <p className="mt-1 text-sm text-red-400">{errors.assigned_fee}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Link
            to="/admin/fee-assignments"
            className="rounded-md bg-gray-600 px-6 py-2 text-white hover:bg-gray-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Assigning...' : 'Assign to Grade'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeeAssignmentCreateGrade;
