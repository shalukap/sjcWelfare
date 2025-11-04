<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fee_assignment_id')->constrained()->onDelete('cascade');
            $table->string('receipt_number');
            $table->date('payment_date');
            $table->decimal('amount_paid', 10, 2);
            $table->enum('payment_method', ['Cash', 'Cheque', 'Online']);
            $table->string('reference_number')->nullable();
            $table->date('deposit_date')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('cheque_no')->nullable();
            $table->boolean('is_realized')->default(false);
            $table->boolean('cancelled')->default(false);
            $table->timestamp('cancellation_date')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->foreignId('cancelled_by_user_id')->nullable()->constrained('users');
            $table->timestamps();

            $table->index('receipt_number');
            $table->index('payment_date');
            $table->index('payment_method');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};
