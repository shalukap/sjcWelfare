<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Student;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $students = Student::all();
        return response()->json($students, 200);
    }

    /**
     * Get the next grade for a given grade string.
     */
    private function nextGrade(?string $grade): string
    {
        $grades = ['1','2','3','4','5','6','7','8','9','10','11','A/L'];
        if ($grade === null) return '';
        $idx = array_search($grade, $grades, true);
        if ($idx === false) return $grade;
        if ($grade === 'A/L') return 'A/L';
        return $grades[$idx + 1] ?? $grade;
    }

    /**
     * Transform a class string when promoting from old grade to new grade.
     */
    private function transformClass(string $currentClass, ?string $oldGrade, ?string $newGrade): string
    {
        if ($oldGrade === 'A/L' || $newGrade === 'A/L') {
            return $currentClass;
        }
        if (preg_match('/^\s*(\d{1,2})(.*)$/u', $currentClass, $m)) {
            $num = (int)$m[1];
            if ($num >= 1 && $num <= 10) {
                $num = $num + 1;
                return $num . $m[2];
            }
        }
        return $currentClass;
    }

    /**
     * Perform academic year upgrade: increment current_grade for all active students.
     */
    public function upgrade(Request $request)
    {
        $validated = $request->validate([
            'academic_year' => 'required|digits:4',
        ]);

        DB::transaction(function () {
            $chunkSize = 500;
            Student::where('is_active', true)->chunkById($chunkSize, function ($students) {
                foreach ($students as $student) {
                    $oldGrade = $student->current_grade;
                    $newGrade = $this->nextGrade($oldGrade);
                    $student->current_grade = $newGrade;

                    if (!empty($student->current_class)) {
                        $student->current_class = $this->transformClass($student->current_class, $oldGrade, $newGrade);
                    }

                    $student->save();
                }
            });
        });

        return response()->json(['message' => 'Students upgraded for academic year ' . $validated['academic_year']], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'admission_number' => 'required|unique:students',
            'name' => 'required',
            'whatsapp_number' => 'nullable',
            'current_grade' => 'required',
            'current_class' => 'required',
            'is_active' => 'boolean',
            'sibling_admission_no' => 'nullable|exists:students,admission_number',
        ]);

        $student = Student::create($validated);
        return response()->json($student, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $student = Student::findOrFail($id);
        return response()->json($student, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $student = Student::findOrFail($id);
        $validated = $request->validate([
            'admission_number' => 'required|unique:students,admission_number,' . $student->id,
            'name' => 'required',
            'whatsapp_number' => 'nullable',
            'current_grade' => 'required',
            'current_class' => 'required',
            'is_active' => 'boolean',
            'sibling_admission_no' => 'nullable|exists:students,admission_number',
        ]);

        $student->update($validated);
        return response()->json($student, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $student = Student::findOrFail($id);
        $student->delete();
        return response()->json(null, 204);
    }

    /**
     * Show upgrade form (for API consistency)
     */
    public function showUpgradeForm()
    {
        return response()->json(['message' => 'Upgrade form endpoint'], 200);
    }
}
