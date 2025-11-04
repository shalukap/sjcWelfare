<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'admission_number',
        'name',
        'whatsapp_number',
        'current_grade',
        'current_class',
        'is_active',
        'sibling_admission_no',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function feeAssignments()
    {
        return $this->hasMany(FeeAssignment::class);
    }
}
