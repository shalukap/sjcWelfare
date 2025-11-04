import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createPayment, updatePayment, fetchPayment, searchStudentAssignments } from '../../api/payments';
import Swal from 'sweetalert2';

const PaymentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const [formData, setFormData] = useState({
    fee_assignment_ids: [],
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    amount_paid: '',
    reference_number: '',
    deposit_date: '',
    bank_name: '',
    cheque_no: '',
    is_realized: false,
  });

  useEffect(() => {
    if (isEdit && id) {
      loadPayment();
    }
  }, [isEdit, id]);

  useEffect(() => {
    if (!isEdit && !hasAutoSearched) {
      const urlParams = new URLSearchParams(window.location.search);
      const admissionNumberParam = urlParams.get('admission_number');
      if (admissionNumberParam) {
        setAdmissionNumber(admissionNumberParam);
        setHasAutoSearched(true);
        searchStudentAssignmentsHandler(admissionNumberParam);
      }
    }
  }, [isEdit, hasAutoSearched]);

  const loadPayment = async () => {
    try {
      const response = await fetchPayment(id);
      const paymentData = response.data;
      setPayment(paymentData);

      setFormData({
        fee_assignment_ids: [paymentData.fee_assignment_id],
        payment_date: paymentData.payment_date.split('T')[0],
        payment_method: paymentData.payment_method,
        amount_paid: paymentData.amount_paid,
        reference_number: paymentData.reference_number || '',
        deposit_date: paymentData.deposit_date ? paymentData.deposit_date.split('T')[0] : '',
        bank_name: paymentData.bank_name || '',
        cheque_no: paymentData.cheque_no || '',
        is_realized: paymentData.is_realized,
      });

      if (paymentData.feeAssignment) {
        setAssignments([paymentData.feeAssignment]);
        setSelectedAssignments([paymentData.fee_assignment_id]);
        setAdmissionNumber(paymentData.feeAssignment.student.admission_number);
      }
    } catch (error) {
      console.error('Failed to fetch payment', error);
      Swal.fire('Error!', 'Failed to load payment data', 'error');
      navigate('/admin/payments');
    } finally {
      setInitialLoading(false);
    }
  };

  const searchStudentAssignmentsHandler = async (admissionNum = null) => {
    const searchAdmissionNumber = admissionNum || admissionNumber;
    if (!searchAdmissionNumber.trim()) {
      Swal.fire('Error!', 'Please enter an admission number.', 'error');
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchStudentAssignments(searchAdmissionNumber);
      const data = response.data;

      if (data.assignments && data.assignments.length > 0) {
        setAssignments(data.assignments);
        setSelectedAssignments([]);
        setFormData(prev => ({ ...prev, fee_assignment_ids: [] }));
        Swal.fire('Success!', `Found ${data.assignments.length} assignment(s) for student.`, 'success');
      } else {
        setAssignments([]);
        setSelectedAssignments([]);
        Swal.fire('No Assignments Found', 'No unpaid assignments found for this student.', 'info');
      }
    } catch (error) {
      console.error('Error searching assignments:', error);
      if (error.response?.data?.error) {
        Swal.fire('Error!', error.response.data.error, 'error');
      } else {
        Swal.fire('Error!', 'Failed to search for assignments.', 'error');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssignmentToggle = (assignmentId) => {
    const newSelectedAssignments = selectedAssignments.includes(assignmentId)
      ? selectedAssignments.filter(id => id !== assignmentId)
      : [...selectedAssignments, assignmentId];

    setSelectedAssignments(newSelectedAssignments);
    setFormData(prev => ({ ...prev, fee_assignment_ids: newSelectedAssignments }));
  };

  const totalAmount = assignments
    .filter(assignment => selectedAssignments.includes(assignment.id))
    .reduce((sum, assignment) => sum + parseFloat(assignment.unpaid_amount), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await updatePayment(id, formData);
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Payment updated successfully',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        if (selectedAssignments.length === 0) {
          Swal.fire('Error!', 'Please select at least one assignment to pay for.', 'error');
          setLoading(false);
          return;
        }

        await createPayment(formData);
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Payment recorded successfully',
          showConfirmButton: false,
          timer: 1500,
        });
      }
      navigate('/admin/payments');
    } catch (error) {
      console.error('Payment submission error:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessage = Object.values(errors).flat().join('\n');
        Swal.fire('Error!', errorMessage, 'error');
      } else if (error.response?.data?.error) {
        Swal.fire('Error!', error.response.data.error, 'error');
      } else {
        Swal.fire('Error!', 'Failed to process payment', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (initialLoading) {
    return <div className="p-4 text-white">Loading...</div>;
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl rounded-xl bg-slate-800 p-8 text-white shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-semibold">
          {isEdit ? 'Edit Payment' : 'Record New Payment'}
        </h2>

        {isEdit && payment && (
          <div className="mb-6 p-4 bg-slate-700 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Current Payment Status</h3>
                <p className="text-sm text-gray-300">Receipt: {payment.receipt_number}</p>
              </div>
              <div className={`px-3 py-1 rounded text-sm font-medium ${
                payment.cancelled ? 'bg-red-600' :
                payment.payment_method === 'Cheque' && !payment.is_realized ? 'bg-yellow-600' :
                'bg-green-600'
              }`}>
                {payment.cancelled ? 'Cancelled' :
                 payment.payment_method === 'Cheque' && !payment.is_realized ? 'Pending' :
                 'Completed'}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Student Admission Number - Only show for create mode */}
          {!isEdit && (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-white">
                Student Admission Number *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter admission number"
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => searchStudentAssignmentsHandler()}
                  disabled={isSearching || !admissionNumber.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Enter the student's admission number and click Search to find their assignments
              </p>

              {/* Student Assignments Display */}
              {assignments.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-4 text-lg font-semibold">Unpaid Dues</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-md">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`assignment-${assignment.id}`}
                            checked={selectedAssignments.includes(assignment.id)}
                            onChange={() => handleAssignmentToggle(assignment.id)}
                            className="h-4 w-4 text-blue-600 bg-slate-700 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`assignment-${assignment.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium">Academic Year {assignment.academic_year}</div>
                            <div className="text-sm text-gray-300">
                              Assigned: Rs. {parseFloat(assignment.assigned_fee).toLocaleString()}
                              {assignment.adjusted_fee !== assignment.assigned_fee && (
                                <span className="ml-2 text-yellow-400">
                                  Adjusted: Rs. {parseFloat(assignment.adjusted_fee).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-green-400 font-medium">
                              Unpaid: Rs. {parseFloat(assignment.unpaid_amount).toLocaleString()}
                            </div>
                            {assignment.adjustment_reason && (
                              <div className="text-xs text-gray-400 mt-1">
                                Reason: {assignment.adjustment_reason}
                              </div>
                            )}
                          </label>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs px-2 py-1 rounded ${
                            assignment.status === 'Unpaid' ? 'bg-red-600' :
                            assignment.status === 'Partially Paid' ? 'bg-yellow-600' : 'bg-green-600'
                          }`}>
                            {assignment.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedAssignments.length > 0 && (
                    <div className="mt-6 p-4 bg-slate-700 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium">Total Due:</span>
                        <span className="text-xl font-bold text-green-400">
                          Rs. {totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 mt-1">
                        {selectedAssignments.length} assignment(s) selected - You can pay any amount up to the total due
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Payment Details */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Payment Date *
            </label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => handleChange('payment_date', e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Amount Paid *
            </label>
            <input
              type="number"
              placeholder="Enter amount paid"
              value={formData.amount_paid}
              onChange={(e) => handleChange('amount_paid', e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
              min="0.01"
              step="0.01"
              required
            />
            {!isEdit && selectedAssignments.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Total due: Rs. {totalAmount.toLocaleString()} | You can pay any amount up to this total
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Payment Method *
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => {
                const newMethod = e.target.value;
                handleChange('payment_method', newMethod);

                if (newMethod !== 'Cheque') {
                  handleChange('bank_name', '');
                  handleChange('cheque_no', '');
                }

                if (newMethod === 'Cash') {
                  handleChange('is_realized', true);
                } else if (!isEdit) {
                  handleChange('is_realized', false);
                }

                if (newMethod !== 'Online') {
                  handleChange('deposit_date', '');
                }
              }}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Method</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Online">Online</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Reference Number
            </label>
            <input
              type="text"
              placeholder="Optional reference number"
              value={formData.reference_number}
              onChange={(e) => handleChange('reference_number', e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {formData.payment_method === 'Online' && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Deposit Date
                </label>
                <input
                  type="date"
                  value={formData.deposit_date}
                  onChange={(e) => handleChange('deposit_date', e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="Enter bank name"
                  value={formData.bank_name}
                  onChange={(e) => handleChange('bank_name', e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {formData.payment_method === 'Cheque' && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Bank Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter bank name"
                  value={formData.bank_name}
                  onChange={(e) => handleChange('bank_name', e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Cheque Number *
                </label>
                <input
                  type="text"
                  placeholder="Enter cheque number"
                  value={formData.cheque_no}
                  onChange={(e) => handleChange('cheque_no', e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_realized"
                checked={formData.is_realized}
                onChange={(e) => handleChange('is_realized', e.target.checked)}
                className="h-4 w-4 text-blue-600 bg-slate-700 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_realized" className="text-sm font-medium text-white">
                Mark Payment as Completed
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {formData.payment_method === 'Cheque'
                ? 'Check this box when the cheque has been cleared and the payment is complete'
                : 'Check this box to mark this payment as fully completed and processed'
              }
            </p>
          </div>
        </div>

        {/* Current Assignment Display - Only show for edit mode */}
        {isEdit && assignments.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold">Current Payment Assignment</h3>
            <div className="p-4 bg-slate-700 rounded-md">
              <div className="font-medium">Academic Year {assignments[0].academic_year}</div>
              <div className="text-sm text-gray-300 mt-1">
                Student: {assignments[0].student.name} ({assignments[0].student.admission_number})
              </div>
              <div className="text-sm text-gray-300">
                Assigned Fee: Rs. {parseFloat(assignments[0].assigned_fee).toLocaleString()}
                {assignments[0].adjusted_fee !== assignments[0].assigned_fee && (
                  <span className="ml-2 text-yellow-400">
                    Adjusted: Rs. {parseFloat(assignments[0].adjusted_fee).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-sm text-green-400 font-medium">
                Payment Amount: Rs. {formData.amount_paid}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/admin/payments"
            className="rounded-lg bg-gray-500 px-6 py-2 font-semibold text-white transition-all hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || (!isEdit && selectedAssignments.length === 0)}
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? (isEdit ? 'Updating...' : 'Recording...') : (isEdit ? 'Update Payment' : 'Record Payment')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
