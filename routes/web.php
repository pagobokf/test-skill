<?php

use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\FavoritePairController;
use Illuminate\Support\Facades\Route;

// Currency Converter Dashboard
Route::get('/', [CurrencyController::class, 'index'])->name('home');

// Currency API endpoints
Route::post('/api/convert', [CurrencyController::class, 'convert'])->name('api.convert');
Route::post('/api/convert-multiple', [CurrencyController::class, 'convertMultiple'])->name('api.convert-multiple');
Route::get('/api/rates', [CurrencyController::class, 'rates'])->name('api.rates');

// Favorite pairs CRUD
Route::post('/favorites', [FavoritePairController::class, 'store'])->name('favorites.store');
Route::put('/favorites/{favoritePair}', [FavoritePairController::class, 'update'])->name('favorites.update');
Route::delete('/favorites/{favoritePair}', [FavoritePairController::class, 'destroy'])->name('favorites.destroy');
