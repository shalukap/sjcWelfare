import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPayments, deletePayment, cancelPayment } from '../../api/payments';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever, MdCancel } from 'react-icons/md';
import Swal from 'sweetalert2';
import { usePermissions } from '../../contexts/PermissionContext';

const PaymentList = () => {
  const { hasPermission, permissions, loading: permissionsLoading } = usePermissions();
  const checkPermission = (module, action) => {
    if (permissionsLoading) return false;
    return hasPermission(module, action);
  };
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchTerm, payments, filterMethod, filterStatus]);

  const loadPayments = async () => {
    try {
      const response = await fetchPayments();
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Failed to fetch payments', error);
      Swal.fire('Error!', 'Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    const searchQuery = searchTerm.toLowerCase();
    const filtered = payments.filter(
      (payment) =>
        (payment.receipt_number.toLowerCase().includes(searchQuery) ||
        (payment.feeAssignment?.student?.admission_number?.toLowerCase().includes(searchQuery)) ||
        (payment.feeAssignment?.student?.name?.toLowerCase().includes(searchQuery)) ||
        String(payment.fee_assignment_id).includes(searchQuery) ||
        payment.payment_method.toLowerCase().includes(searchQuery) ||
        String(payment.amount_paid).includes(searchQuery) ||
        (payment.cheque_no?.toLowerCase().includes(searchQuery))) &&
        (filterMethod === 'all' || payment.payment_method === filterMethod) &&
        (filterStatus === 'all' ||
          (filterStatus === 'cancelled' && payment.cancelled) ||
          (filterStatus === 'pending' && payment.payment_method === 'Cheque' && !payment.is_realized && !payment.cancelled) ||
          (filterStatus === 'completed' &&
            ((payment.payment_method === 'Cheque' && payment.is_realized) ||
             (payment.payment_method !== 'Cheque') && !payment.cancelled))
        )
    );
    setFilteredPayments(filtered);
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
        await deletePayment(id);
        Swal.fire('Deleted!', 'The payment record has been deleted.', 'success');
        loadPayments();
      } catch (error) {
        console.error('Failed to delete payment', error);
        Swal.fire('Error!', 'There was an error deleting the payment.', 'error');
      }
    }
  };

  const handleCancel = async (id) => {
    const { value: reason } = await Swal.fire({
      title: 'Cancel Payment',
      input: 'textarea',
      inputLabel: 'Cancellation Reason',
      inputPlaceholder: 'Enter the reason for cancelling this payment...',
      inputValidator: (value) => {
        if (!value) {
          return 'Cancellation reason is required!';
        }
      },
      showCancelButton: true,
      confirmButtonText: 'Cancel Payment',
      confirmButtonColor: '#d33',
    });

    if (reason) {
      try {
        await cancelPayment(id, reason);
        Swal.fire('Cancelled!', 'The payment has been cancelled.', 'success');
        loadPayments();
      } catch (error) {
        console.error('Failed to cancel payment', error);
        Swal.fire('Error!', 'There was an error cancelling the payment.', 'error');
      }
    }
  };

  const getStatusColor = (payment) => {
    if (payment.cancelled) return 'bg-red-500';
    if (payment.payment_method === 'Cheque' && !payment.is_realized) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (payment) => {
    if (payment.cancelled) return 'Cancelled';
    if (payment.payment_method === 'Cheque' && !payment.is_realized) return 'Pending';
    return 'Completed';
  };

  if (loading) {
    return <div className="p-4 text-white">Loading...</div>;
  }

  return (
    <div className="h-full w-full overflow-x-auto p-4">
      <div className="mx-auto max-w-full rounded-xl bg-slate-800 p-8 text-white shadow-lg mb-6">
        <h2 className="mb-6 text-center text-2xl font-semibold">Payment Records</h2>

        <div className="flex flex-col gap-6 items-center">
          {checkPermission('Payments', 'Add') && (
            <Link
              to="/admin/payments/create"
              className="rounded-md bg-green-600 px-6 py-3 text-white hover:bg-green-700 text-lg font-medium"
            >
              Record New Payment
            </Link>
          )}

          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by Receipt No, Admission No, Name, etc."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <select
                className="w-full rounded-md border border-gray-300 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
              >
                <option value="all">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Online">Online</option>
              </select>
            </div>

            <div>
              <select
                className="w-full rounded-md border border-gray-300 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-[1400px] divide-y divide-gray-200">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Receipt No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Student</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Academic Year</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Reference</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Bank</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Cheque No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Payment Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Realized</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-slate-800">
            {filteredPayments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-4 py-2 font-medium">{payment.receipt_number}</td>
                <td className="px-4 py-2">
                  {payment.feeAssignment?.student ? (
                    <div>
                      <div className="font-medium">{payment.feeAssignment.student.name}</div>
                      <div className="text-xs text-gray-500">
                        {payment.feeAssignment.student.admission_number} - Grade {payment.feeAssignment.student.current_grade}
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600 font-medium">
                      <div>Fee Assignment Missing</div>
                      <div className="text-xs text-gray-500">
                        ID: {payment.fee_assignment_id}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">
                  {payment.feeAssignment?.academic_year || 'N/A'}
                </td>
                <td className="px-4 py-2 font-medium">Rs. {parseFloat(payment.amount_paid).toLocaleString()}</td>
                <td className="px-4 py-2">{payment.payment_method}</td>
                <td className="px-4 py-2">{payment.reference_number || 'N/A'}</td>
                <td className="px-4 py-2">{payment.bank_name || 'N/A'}</td>
                <td className="px-4 py-2">{payment.cheque_no || 'N/A'}</td>
                <td className="px-4 py-2">{new Date(payment.payment_date).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  {payment.payment_method === 'Cheque' ? (
                    payment.is_realized ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-red-600 font-medium">No</span>
                    )
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-white text-xs ${getStatusColor(payment)}`}
                  >
                    {getStatusText(payment)}
                  </span>
                </td>
                <td className="flex items-center gap-2 px-4 py-2">
                  {!payment.cancelled && (
                    <>
                      {checkPermission('Payments', 'Edit') && (
                        <Link to={`/admin/payments/edit/${payment.id}`}>
                          <FaEdit className="text-xl hover:text-green-700" />
                        </Link>
                      )}
                      {checkPermission('Payments', 'Edit') && (
                        <button onClick={() => handleCancel(payment.id)} title="Cancel Payment">
                          <MdCancel className="text-xl hover:text-orange-700" />
                        </button>
                      )}
                    </>
                  )}
                  {checkPermission('Payments', 'Delete') && (
                    <button onClick={() => handleDelete(payment.id)} title="Delete Payment">
                      <MdDeleteForever className="text-xl hover:text-red-700" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPayments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No payments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentList;
