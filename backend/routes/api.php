<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\UserController;

// 1. Asignar nombre 'login' para que Sanctum no lance RouteNotFoundException
Route::post('/login', [AuthController::class, 'login'])->name('login');

// Rutas protegidas por Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Notas del tablero
    Route::apiResource('notes', NoteController::class);

    // Rutas de administración de usuarios
    Route::middleware('can:admin-only')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
    });
});