import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchFeeAssignments, fetchFeeAssignment, updateFeeAssignment } from '../../api/feeAssignments';
import Swal from 'sweetalert2';

const FeeAssignmentEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [feeAssignment, setFeeAssignment] = useState(null);
  const [formData, setFormData] = useState({
    adjusted_fee: '',
    adjustment_reason: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadFeeAssignment();
  }, [id]);

 const loadFeeAssignment = async () => {
  try {
    const response = await fetchFeeAssignment(id);
    const assignment = response.data;

    if (assignment) {
      setFeeAssignment(assignment);
      setFormData({
        adjusted_fee: assignment.adjusted_fee.toString(),
        adjustment_reason: assignment.adjustment_reason || '',
      });
    } else {
      Swal.fire('Error!', 'Fee assignment not found', 'error');
      navigate('/admin/fee-assignments');
    }
  } catch (error) {
    console.error('Failed to fetch fee assignment', error);
    Swal.fire('Error!', 'Failed to load fee assignment', 'error');
    navigate('/admin/fee-assignments');
  } finally {
    setInitialLoading(false);
  }
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await updateFeeAssignment(id, formData);

      await Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Fee assignment updated successfully!',
        showConfirmButton: false,
        timer: 1500
      });

      navigate('/admin/fee-assignments');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire('Error!', 'Failed to update fee assignment', 'error');
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

  if (initialLoading) {
    return <div className="p-4 text-white">Loading...</div>;
  }

  if (!feeAssignment) {
    return <div className="p-4 text-white">Fee assignment not found</div>;
  }

  return (
    <div className="h-full w-full overflow-x-auto p-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl rounded-xl bg-slate-800 p-8 text-white shadow-lg"
      >
        <h2 className="mb-6 text-center text-2xl font-semibold">Adjust Student Fee</h2>

        <div className="mb-6 rounded-lg bg-slate-700 p-4">
          <h3 className="mb-3 text-lg font-semibold">Student Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-300">Admission No:</span>
              <p className="font-medium">{feeAssignment.student.admission_number}</p>
            </div>
            <div>
              <span className="text-sm text-gray-300">Name:</span>
              <p className="font-medium">{feeAssignment.student.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-300">Grade:</span>
              <p className="font-medium">{feeAssignment.student.current_grade}</p>
            </div>
            <div>
              <span className="text-sm text-gray-300">Academic Year:</span>
              <p className="font-medium">{feeAssignment.academic_year}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="assigned_fee" className="mb-2 block text-sm font-medium">
              Original Assigned Fee (Rs.)
            </label>
            <input
              type="text"
              id="assigned_fee"
              value={parseFloat(feeAssignment.assigned_fee).toLocaleString()}
              className="w-full rounded-md border border-gray-300 bg-slate-700 px-4 py-2 text-white opacity-70"
              readOnly
              disabled
            />
          </div>

          <div>
            <label htmlFor="adjusted_fee" className="mb-2 block text-sm font-medium">
              Adjusted Fee (Rs.)
            </label>
            <input
              type="number"
              id="adjusted_fee"
              value={formData.adjusted_fee}
              onChange={(e) => handleChange('adjusted_fee', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter adjusted fee"
              min="0"
              step="0.01"
              required
            />
            {errors.adjusted_fee && (
              <p className="mt-1 text-sm text-red-400">{errors.adjusted_fee}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="adjustment_reason" className="mb-2 block text-sm font-medium">
              Adjustment Reason
            </label>
            <textarea
              id="adjustment_reason"
              value={formData.adjustment_reason}
              onChange={(e) => handleChange('adjustment_reason', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Reason for fee adjustment (optional)"
              rows={3}
            />
            {errors.adjustment_reason && (
              <p className="mt-1 text-sm text-red-400">{errors.adjustment_reason}</p>
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
            {loading ? 'Updating...' : 'Update Fee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeeAssignmentEdit;
