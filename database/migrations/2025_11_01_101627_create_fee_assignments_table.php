<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('fee_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('academic_year', 4);
            $table->decimal('assigned_fee', 10, 2);
            $table->decimal('adjusted_fee', 10, 2);
            $table->text('adjustment_reason')->nullable();
            $table->string('status')->default('Unpaid');
            $table->timestamps();

            // Unique constraint to prevent duplicate assignments
            $table->unique(['student_id', 'academic_year']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('fee_assignments');
    }
};
