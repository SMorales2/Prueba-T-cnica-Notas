<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'text',
        'status',
        'position_x',
        'position_y',
        'user_id',
    ];

    // Relación: una nota pertenece a un usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}