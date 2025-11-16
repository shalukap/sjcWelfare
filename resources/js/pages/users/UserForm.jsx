import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createUser, fetchUser, updateUser } from '../../api/users';
import { success, error as swalError } from '../../utils/swal';

const MODULES = [
  { key: 'Students', actions: ['Add', 'Edit', 'View', 'Delete'] },
  { key: 'Payments', actions: ['Add', 'Edit', 'View', 'Delete'] },
  { key: 'Fee Assignment', actions: ['Add', 'Edit', 'View', 'Delete'] },
  { key: 'Upgrading', actions: ['Add', 'Edit', 'View', 'Delete'] },
];

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    permissions: {},
    is_admin: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadUser();
    }
  }, [isEdit, id]);

  const loadUser = async () => {
    try {
      const { data } = await fetchUser(id);
      setFormData(prev => ({
        ...prev,
        name: data.name || '',
        email: data.email || '',
        permissions: data.permissions || {},
        is_admin: !!data.is_admin,
      }));
    } catch (e) {
      swalError('Failed to load user', 'Please try again.');
    }
  };

  const handleField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const togglePermission = (moduleKey, action) => {
    setFormData(prev => {
      const next = { ...prev };
      const modulePerms = { ...(next.permissions?.[moduleKey] || {}) };
      modulePerms[action] = !modulePerms[action];
      next.permissions = { ...(next.permissions || {}), [moduleKey]: modulePerms };
      return next;
    });
  };

  const toggleSelectAll = (moduleKey, checked) => {
    setFormData(prev => {
      const next = { ...prev };
      const actionsSet = {};
      const module = MODULES.find(m => m.key === moduleKey);
      module.actions.forEach(a => { actionsSet[a] = checked; });
      next.permissions = { ...(next.permissions || {}), [moduleKey]: actionsSet };
      return next;
    });
  };

  const isAllSelected = (moduleKey) => {
    const module = MODULES.find(m => m.key === moduleKey);
    const modPerms = formData.permissions?.[moduleKey] || {};
    return module.actions.every(a => modPerms[a]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      if (isEdit) {
        const payload = {
          name: formData.name,
          email: formData.email,
          permissions: formData.permissions || {},
          is_admin: !!formData.is_admin,
        };
        if (formData.password) {
          payload.password = formData.password;
          payload.password_confirmation = formData.password_confirmation;
        }
        await updateUser(id, payload);
        await success('User updated successfully', '');
      } else {
        await createUser(formData);
        await success('User created successfully', '');
      }
      navigate('/admin/users');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        swalError('Failed to save user', 'Please check the form and try again.');
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl rounded-xl bg-slate-800 p-8 text-white shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{isEdit ? 'Edit User' : 'Add New User'}</h2>
          <div className="space-x-2">
            <Link to="/admin/users" className="rounded bg-gray-600 px-4 py-2 hover:bg-gray-500">Back</Link>
            <button disabled={loading} className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-500 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleField('name', e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleField('email', e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
          </div>

          {!isEdit && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleField('password', e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Confirm Password *</label>
                <input
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) => handleField('password_confirmation', e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          )}

          {isEdit && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">New Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleField('password', e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Confirm New Password</label>
                <input
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) => handleField('password_confirmation', e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-xl font-semibold">Permissions</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-600">
            <table className="w-full table-auto text-left">
              <thead>
                <tr className="bg-slate-700">
                  <th className="px-6 py-4 text-left font-semibold">Module</th>
                  <th className="px-4 py-4 text-center font-semibold">Select All</th>
                  <th className="px-4 py-4 text-center font-semibold">Add</th>
                  <th className="px-4 py-4 text-center font-semibold">Edit</th>
                  <th className="px-4 py-4 text-center font-semibold">View</th>
                  <th className="px-4 py-4 text-center font-semibold">Delete</th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m) => {
                  const modulePerms = formData.permissions?.[m.key] || {};
                  return (
                    <tr key={m.key} className="border-b border-slate-700 hover:bg-slate-750 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{m.key}</td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected(m.key)}
                          onChange={(e) => toggleSelectAll(m.key, e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </td>
                      {m.actions.map(action => (
                        <td key={action} className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={!!modulePerms[action]}
                            onChange={() => togglePermission(m.key, action)}
                            className="w-5 h-5 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Admin note */}
          {formData.is_admin && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                <span className="font-semibold">Admin Note:</span> Admin users have full access to all modules regardless of permission settings.
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserForm;


