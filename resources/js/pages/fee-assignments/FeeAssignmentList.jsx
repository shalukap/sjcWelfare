import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeeAssignments, deleteFeeAssignment } from '../../api/feeAssignments';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import Swal from 'sweetalert2';

const FeeAssignmentList = () => {
  const [feeAssignments, setFeeAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeeAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [searchTerm, feeAssignments]);

  const loadFeeAssignments = async () => {
    try {
      const response = await fetchFeeAssignments();
      setFeeAssignments(response.data.feeAssignments);
    } catch (error) {
      console.error('Failed to fetch fee assignments', error);
      Swal.fire('Error!', 'Failed to load fee assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    const searchQuery = searchTerm.toLowerCase();
    const filtered = feeAssignments.filter(
      (assignment) =>
        assignment.student.admission_number.toLowerCase().includes(searchQuery) ||
        assignment.student.name.toLowerCase().includes(searchQuery) ||
        assignment.student.current_grade.toLowerCase().includes(searchQuery) ||
        String(assignment.academic_year).toLowerCase().includes(searchQuery)
    );
    setFilteredAssignments(filtered);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await deleteFeeAssignment(id);
        Swal.fire('Deleted!', 'The fee assignment has been deleted.', 'success');
        loadFeeAssignments();
      } catch (error) {
        console.error('Failed to delete fee assignment', error);
        Swal.fire('Error!', 'There was an error deleting the fee assignment.', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-500';
      case 'Partially Paid': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  if (loading) {
    return <div className="p-4 text-white">Loading...</div>;
  }

  return (
    <div className="h-full w-full overflow-x-auto p-4">
      <div className="mx-auto max-w-full rounded-xl bg-slate-800 p-8 text-white shadow-lg mb-6">
        <h2 className="mb-6 text-center text-2xl font-semibold">Fee Assignments</h2>

        <div className="flex flex-col gap-6 items-center">
          <Link
            to="/admin/fee-assignments/create-grade"
            className="rounded-md bg-green-600 px-6 py-3 text-white hover:bg-green-700 text-lg font-medium"
          >
            Assign to Grade
          </Link>

          <div className="w-full max-w-md">
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by Admission No, Name, Grade, or Year"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Admission No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Grade</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Academic Year</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Assigned Fee</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Adjusted Fee</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Adjustment Reason</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-slate-800">
            {filteredAssignments.map((assignment) => (
              <tr key={assignment.id}>
                <td className="px-4 py-2">{assignment.student.admission_number}</td>
                <td className="px-4 py-2">{assignment.student.name}</td>
                <td className="px-4 py-2">{assignment.student.current_grade}</td>
                <td className="px-4 py-2">{assignment.academic_year}</td>
                <td className="px-4 py-2">Rs. {parseFloat(assignment.assigned_fee).toLocaleString()}</td>
                <td className="px-4 py-2">Rs. {parseFloat(assignment.adjusted_fee).toLocaleString()}</td>
                <td className="px-4 py-2">{assignment.adjustment_reason || 'None'}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-white ${getStatusColor(assignment.status)}`}
                  >
                    {assignment.status}
                  </span>
                </td>
                <td className="flex items-center gap-3 px-4 py-2">
                  <Link to={`/admin/fee-assignments/edit/${assignment.id}`}>
                    <FaEdit className="text-2xl hover:text-blue-700" />
                  </Link>
                  <button
                    onClick={() => handleDelete(assignment.id)}
                    title="Delete Fee Assignment"
                  >
                    <MdDeleteForever className="text-3xl hover:text-red-700" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAssignments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No fee assignments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeAssignmentList;
