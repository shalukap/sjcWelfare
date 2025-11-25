<?php

use App\Http\Controllers\API\StudentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\FeeAssignmentController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\DueReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('students', StudentController::class);
    Route::post('/students/upgrade', [StudentController::class, 'upgrade']);
    Route::get('/students/upgrade-form', [StudentController::class, 'showUpgradeForm']);
    // Fee Assignment Routes
    Route::get('/fee-assignments', [FeeAssignmentController::class, 'index']);
    Route::get('/fee-assignments/grades', [FeeAssignmentController::class, 'getGrades']);
    Route::get('/fee-assignments/{id}', [FeeAssignmentController::class, 'show']);
    Route::post('/fee-assignments/grade', [FeeAssignmentController::class, 'storeGrade']);
    Route::put('/fee-assignments/{id}', [FeeAssignmentController::class, 'update']);
    Route::delete('/fee-assignments/{id}', [FeeAssignmentController::class, 'destroy']);
    //Payment Routes
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments/search-students', [PaymentController::class, 'searchStudents']);
    Route::get('/payments/search-student-assignments', [PaymentController::class, 'searchStudentAssignments']);
    Route::get('/payments/student-assignments/{studentId}', [PaymentController::class, 'getStudentAssignments']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::put('/payments/{id}', [PaymentController::class, 'update']);
    Route::delete('/payments/{id}', [PaymentController::class, 'destroy']);
    Route::post('/payments/{id}/cancel', [PaymentController::class, 'cancel']);
    Route::get('/payments/generate-pdf', [PaymentController::class, 'generatePDF']);
    Route::get('/due-reports', [DueReportController::class, 'index']);
    Route::post('/due-reports/generate', [DueReportController::class, 'generateDueReport']);
});
