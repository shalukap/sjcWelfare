import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteUser, fetchUsers } from '../../api/users';
import { success, error as swalError } from '../../utils/swal';
import { usePermissions } from '../../contexts/PermissionContext';

const UsersList = () => {
  const { hasPermission, permissions, loading: permissionsLoading } = usePermissions();
  // During loading, hide permission-based actions; afterwards rely on hasPermission
  const checkPermission = (module, action) => {
    if (permissionsLoading) return false;
    return hasPermission(module, action);
  };
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await fetchUsers();
      setUsers(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (e) {
      swalError('Failed to load users', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    try {
      await deleteUser(id);
      await success('User deleted', '');
      load();
    } catch (e) {
      swalError('Delete failed', 'Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        {checkPermission('Users', 'Add') && (
          <Link to="/admin/users/create" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500">
            Add User
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl bg-slate-800 p-4 shadow">
        <table className="w-full table-auto text-left text-white">
          <thead>
            <tr className="bg-slate-700">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
        <tbody>
            {loading ? (
              <tr><td className="px-4 py-3" colSpan={4}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td className="px-4 py-3" colSpan={4}>No users found</td></tr>
            ) : (
              users.map((u, idx) => (
                <tr key={u.id} className="border-b border-slate-700">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 space-x-2">
                    {checkPermission('Users', 'Edit') && (
                      <button
                        className="rounded bg-green-600 px-3 py-1 text-sm hover:bg-green-500"
                        onClick={() => navigate(`/admin/users/edit/${u.id}`)}
                      >
                        Edit
                      </button>
                    )}
                    {checkPermission('Users', 'Delete') && (
                      <button
                        className="rounded bg-red-600 px-3 py-1 text-sm hover:bg-red-500"
                        onClick={() => onDelete(u.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersList;


