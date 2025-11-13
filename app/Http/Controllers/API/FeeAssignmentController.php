<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FeeAssignment;
use App\Models\Student;
use Illuminate\Support\Facades\DB;

class FeeAssignmentController extends Controller
{
    public function __construct()
    {

    }

    /**
     * Display a listing of fee assignments with search functionality.
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');

        $feeAssignments = FeeAssignment::with('student')
            ->when($search, function ($query, $search) {
                $query->whereHas('student', function ($q) use ($search) {
                    $q->where('admission_number', 'like', "%{$search}%")
                      ->orWhere('name', 'like', "%{$search}%")
                      ->orWhere('current_grade', 'like', "%{$search}%");
                });
            })
            ->orderBy('academic_year', 'desc')
            ->orderBy('student_id')
            ->get();

        return response()->json([
            'feeAssignments' => $feeAssignments,
            'search' => $search
        ], 200);
    }

    /**
     * Get available grades for fee assignment
     */
    public function getGrades()
    {
        $grades = Student::distinct()->pluck('current_grade')->filter()->values();
        return response()->json($grades, 200);
    }

    /**
     * Store fee assignments for all students in a specific grade and academic year.
     */
    public function storeGrade(Request $request)
    {
        $validated = $request->validate([
            'academic_year' => 'required|string|max:4',
            'grade' => 'required|string',
            'assigned_fee' => 'required|numeric|min:0',
        ]);

        $students = Student::where('current_grade', $validated['grade'])
            ->where('is_active', true)
            ->get();

        if ($students->isEmpty()) {
            return response()->json([
                'error' => 'No active students found in grade ' . $validated['grade']
            ], 422);
        }

        DB::beginTransaction();

        try {
            $created = 0;
            $skipped = 0;

            foreach ($students as $student) {
                $existingAssignment = FeeAssignment::where('student_id', $student->id)
                    ->where('academic_year', $validated['academic_year'])
                    ->first();

                if (!$existingAssignment) {
                    FeeAssignment::create([
                        'student_id' => $student->id,
                        'academic_year' => $validated['academic_year'],
                        'assigned_fee' => $validated['assigned_fee'],
                        'adjusted_fee' => $validated['assigned_fee'],
                        'adjustment_reason' => null,
                        'status' => 'Unpaid'
                    ]);
                    $created++;
                } else {
                    $skipped++;
                }
            }

            DB::commit();

            $message = "Fee assignments created for $created student(s)";
            if ($skipped > 0) {
                $message .= ". Skipped $skipped student(s) with existing assignments";
            }

            return response()->json(['message' => $message], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create fee assignments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an individual student's fee assignment with adjustment.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'adjusted_fee' => 'required|numeric|min:0',
            'adjustment_reason' => 'nullable|string|max:500',
        ]);

        $feeAssignment = FeeAssignment::findOrFail($id);

        $feeAssignment->update([
            'adjusted_fee' => $validated['adjusted_fee'],
            'adjustment_reason' => $validated['adjustment_reason']
        ]);

        return response()->json(['message' => 'Fee assignment updated successfully'], 200);
    }

    /**
     * Remove the specified fee assignment.
     */
    public function destroy($id)
    {
        $feeAssignment = FeeAssignment::findOrFail($id);
        $feeAssignment->delete();

        return response()->json(null, 204);
    }
    public function show($id)
    {
        $feeAssignment = FeeAssignment::with('student')->findOrFail($id);
        return response()->json($feeAssignment, 200);
    }
}

