<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Payment;
use App\Models\FeeAssignment;
use App\Models\Student;
use App\Models\User;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $payments = Payment::with([
            'feeAssignment' => function($query) {
                $query->withTrashed();
            },
            'feeAssignment.student',
            'cancelledBy'
        ])->orderBy('created_at', 'desc')->get();

        $paymentsArray = $payments->map(function ($p) {
            $arr = $p->toArray();

            if (array_key_exists('fee_assignment', $arr) && !array_key_exists('feeAssignment', $arr)) {
                $arr['feeAssignment'] = $arr['fee_assignment'];
            }
            return $arr;
        });

        return response()->json(['payments' => $paymentsArray], 200);
    }

    /**
     * Search for students by name or admission number.
     */
    public function searchStudents(Request $request)
    {
        $query = $request->query('q', '');
        $grade = $request->query('grade', '');
        $class = $request->query('class', '');

        if (empty($query) && empty($grade) && empty($class)) {
            return response()->json([]);
        }

        $students = Student::query();

        if (!empty($grade)) {
            $students->where('current_grade', $grade);
        }

        if (!empty($class)) {
            $students->where('current_class', $class);
        }

        if (!empty($query)) {
            $students->where(function($q) use ($query) {
                $q->where('admission_number', 'like', "%{$query}%")
                  ->orWhere('name', 'like', "%{$query}%");
            });
        }

        $results = $students->orderBy('name')
            ->limit(10)
            ->get(['id', 'admission_number', 'name', 'current_grade', 'current_class']);

        return response()->json($results);
    }

    /**
     * Search for student assignments by admission number.
     */
    public function searchStudentAssignments(Request $request)
    {
        $admissionNumber = $request->query('admission_number', '');

        if (empty($admissionNumber)) {
            return response()->json(['error' => 'Admission number is required'], 400);
        }

        $student = Student::where('admission_number', $admissionNumber)->first();

        if (!$student) {
            return response()->json(['error' => 'Student not found'], 404);
        }

        $assignments = FeeAssignment::with('student')
            ->where('student_id', $student->id)
            ->whereIn('status', ['Unpaid', 'Partially Paid'])
            ->get()
            ->map(function ($assignment) {
                $assignment->unpaid_amount = $assignment->getUnpaidAmount();
                return $assignment;
            });

        return response()->json([
            'student' => $student,
            'assignments' => $assignments
        ]);
    }

    /**
     * Get unpaid fee assignments for a specific student.
     */
    public function getStudentAssignments(Request $request, $studentId)
    {
        $student = Student::findOrFail($studentId);

        $assignments = FeeAssignment::with('student')
            ->where('student_id', $studentId)
            ->whereIn('status', ['Unpaid', 'Partially Paid'])
            ->get()
            ->map(function ($assignment) {
                $assignment->unpaid_amount = $assignment->getUnpaidAmount();
                return $assignment;
            });

        return response()->json([
            'student' => $student,
            'assignments' => $assignments
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fee_assignment_ids' => 'required|array',
            'fee_assignment_ids.*' => 'required|exists:fee_assignments,id',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:Cash,Cheque,Online',
            'amount_paid' => 'required|numeric|min:0',
            'reference_number' => 'nullable|string',
            'deposit_date' => 'nullable|date|required_if:payment_method,Online',
            'bank_name' => 'nullable|string|required_if:payment_method,Cheque|required_if:payment_method,Online',
            'cheque_no' => 'nullable|string|required_if:payment_method,Cheque',
            'is_realized' => 'boolean',
        ]);

        $feeAssignmentIds = $validated['fee_assignment_ids'];
        $assignments = FeeAssignment::whereIn('id', $feeAssignmentIds)->get();

        $studentIds = $assignments->pluck('student_id')->unique();
        if ($studentIds->count() > 1) {
            return response()->json([
                'error' => 'All selected assignments must belong to the same student.'
            ], 422);
        }

        $totalUnpaidAmount = $assignments->sum(function ($assignment) {
            return $assignment->getUnpaidAmount();
        });

        if ($validated['amount_paid'] > $totalUnpaidAmount) {
            return response()->json([
                'error' => 'Payment amount cannot exceed the total unpaid amount of Rs. ' . number_format($totalUnpaidAmount, 2)
            ], 422);
        }

        $remainingPayment = $validated['amount_paid'];
        $payments = [];

        $baseReceiptNumber = $this->generateReceiptNumber($validated['payment_date']);

        foreach ($assignments as $index => $assignment) {
            if ($remainingPayment <= 0) {
                break;
            }

            $unpaidAmount = $assignment->getUnpaidAmount();

            if ($unpaidAmount <= 0) {
                continue;
            }

            $paymentAmount = min($remainingPayment, $unpaidAmount);

            $receiptNumber = $baseReceiptNumber;

            $paymentData = [
                'fee_assignment_id' => $assignment->id,
                'receipt_number' => $receiptNumber,
                'payment_date' => $validated['payment_date'],
                'amount_paid' => $paymentAmount,
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'],
                'deposit_date' => $validated['deposit_date'] ?? null,
                'bank_name' => $validated['bank_name'] ?? null,
                'cheque_no' => $validated['cheque_no'] ?? null,
                'is_realized' => $validated['payment_method'] === 'Cash' ? true : ($validated['is_realized'] ?? false),
            ];

            $payments[] = Payment::create($paymentData);
            $remainingPayment -= $paymentAmount;
        }

        return response()->json([
            'message' => count($payments) . ' payment(s) recorded successfully for Rs. ' . number_format($validated['amount_paid'], 2),
            'payments' => $payments
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $payment = Payment::with(['feeAssignment.student', 'cancelledBy'])->findOrFail($id);
        return response()->json($payment, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $payment = Payment::findOrFail($id);

        $validated = $request->validate([
            'fee_assignment_id' => 'required|exists:fee_assignments,id',
            'receipt_number' => 'required|string|max:255',
            'payment_date' => 'required|date',
            'amount_paid' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:Cash,Cheque,Online',
            'reference_number' => 'nullable|string',
            'deposit_date' => 'nullable|date|required_if:payment_method,Online',
            'bank_name' => 'nullable|string|required_if:payment_method,Cheque|required_if:payment_method,Online',
            'cheque_no' => 'nullable|string|required_if:payment_method,Cheque',
            'is_realized' => 'boolean',
        ]);

        $feeAssignment = FeeAssignment::findOrFail($validated['fee_assignment_id']);
        $unpaidAmount = $feeAssignment->getUnpaidAmount() + $payment->amount_paid;

        if ($validated['amount_paid'] > $unpaidAmount) {
            return response()->json([
                'error' => 'Payment amount cannot exceed the unpaid amount of Rs. ' . number_format($unpaidAmount, 2)
            ], 422);
        }

        $validated['is_realized'] = $validated['payment_method'] === 'Cash' ? true : ($validated['is_realized'] ?? false);

        $payment->update($validated);

        return response()->json(['message' => 'Payment updated successfully'], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $payment = Payment::findOrFail($id);

        if ($payment->cancelled) {
            return response()->json(['error' => 'Cannot delete a cancelled payment'], 422);
        }

        $payment->delete();

        return response()->json(null, 204);
    }

    /**
     * Cancel a payment.
     */
    public function cancel(Request $request, string $id)
    {
        $validated = $request->validate([
            'cancellation_reason' => 'required|string',
        ]);

        $payment = Payment::findOrFail($id);

        if ($payment->cancelled) {
            return response()->json(['error' => 'Payment is already cancelled'], 422);
        }

        $payment->update([
            'cancelled' => true,
            'cancellation_date' => now(),
            'cancellation_reason' => $validated['cancellation_reason'],
            'cancelled_by_user_id' => Auth::check() ? Auth::id() : null,
        ]);

        return response()->json(['message' => 'Payment cancelled successfully'], 200);
    }

    /**
     * Generate a unique receipt number starting with F followed by 7 digits.
     */
    private function generateReceiptNumber(string $paymentDate): string
    {
        $lastPayment = Payment::where('receipt_number', 'like', 'F%')
            ->orderBy('receipt_number', 'desc')
            ->first();

        if ($lastPayment) {
            $sequence = (int) substr($lastPayment->receipt_number, 1);
            $newSequence = $sequence + 1;
        } else {
            $newSequence = 1;
        }

        return 'F' . str_pad($newSequence, 7, '0', STR_PAD_LEFT);
    }

    /**
     * Generate PDF receipt
     */
    public function generatePDF()
    {
        // For now, return a success message
        return response()->json(['message' => 'PDF generation endpoint'], 200);
    }
}
