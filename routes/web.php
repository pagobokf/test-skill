<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/test', 'test')->name('test');
Route::inertia('/go', 'go')->name('go');
