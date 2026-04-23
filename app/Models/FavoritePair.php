<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FavoritePair extends Model
{
    protected $fillable = [
        'from_currency',
        'to_currency',
        'label',
    ];
}
