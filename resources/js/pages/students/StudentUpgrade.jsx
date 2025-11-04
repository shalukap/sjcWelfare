import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { upgradeStudents } from '../../api/students';
import { confirm, success, error as swalError } from '../../utils/swal';

const StudentUpgrade = () => {
  const navigate = useNavigate();
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await confirm({
      title: 'Upgrade students? ',
      text: `This will move all active students up by one grade for academic year ${academicYear}. This action cannot be undone.`,
      confirmButtonText: 'Yes, upgrade',
    });

    if (!res.isConfirmed) return;

    setLoading(true);
    try {
      await upgradeStudents(academicYear);
      await success('Students upgraded successfully!', '');
      navigate('/admin/students');
    } catch (err) {
      console.error('Upgrade failed', err);
      swalError('Upgrade failed', 'Please check the form and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-xl rounded-xl bg-slate-800 p-8 text-white shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-semibold">Upgrade Students</h2>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-white">Academic Year</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            title="Enter a 4-digit year"
            className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            required
          />
        </div>

        <div className="flex justify-center gap-3">
          <Link
            to="/admin/students"
            className="rounded-lg bg-gray-500 px-6 py-2 font-semibold text-white hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? 'Upgrading...' : 'Upgrade'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentUpgrade;
