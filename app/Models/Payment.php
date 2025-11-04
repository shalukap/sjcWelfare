<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'fee_assignment_id',
        'receipt_number',
        'payment_date',
        'amount_paid',
        'payment_method',
        'reference_number',
        'deposit_date',
        'bank_name',
        'cheque_no',
        'is_realized',
        'cancelled',
        'cancellation_date',
        'cancellation_reason',
        'cancelled_by_user_id',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'deposit_date' => 'date',
        'cancellation_date' => 'datetime',
        'amount_paid' => 'decimal:2',
        'is_realized' => 'boolean',
        'cancelled' => 'boolean',
    ];

    protected static function booted()
    {
        static::saved(function ($payment) {
            if ($payment->feeAssignment) {
                $payment->feeAssignment->updateStatus();
            }
        });

        static::deleted(function ($payment) {
            if ($payment->feeAssignment) {
                $payment->feeAssignment->updateStatus();
            }
        });
    }

    /**
     * Get the fee assignment that owns the payment.
     */
    public function feeAssignment()
    {
        return $this->belongsTo(FeeAssignment::class);
    }

    /**
     * Get the user who cancelled the payment.
     */
    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by_user_id');
    }

    /**
     * Scope a query to only include uncancelled payments.
     */
    public function scopeUncancelled($query)
    {
        return $query->where('cancelled', false);
    }

    /**
     * Scope a query to only include cancelled payments.
     */
    public function scopeCancelled($query)
    {
        return $query->where('cancelled', true);
    }

    /**
     * Scope a query to only include realized payments (cheques that cleared).
     */
    public function scopeRealized($query)
    {
        return $query->where('is_realized', true);
    }

    /**
     * Scope a query to only include payments by a specific method.
     */
    public function scopeByMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    /**
     * Scope a query to only include payments within a date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
    }

    /**
     * Check if payment is of type Cheque.
     */
    public function isCheque()
    {
        return $this->payment_method === 'Cheque';
    }

    /**
     * Check if payment is of type Online.
     */
    public function isOnline()
    {
        return $this->payment_method === 'Online';
    }

    /**
     * Check if payment is of type Cash.
     */
    public function isCash()
    {
        return $this->payment_method === 'Cash';
    }
}
