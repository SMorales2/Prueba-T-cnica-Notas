<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NoteController;
use Illuminate\Support\Facades\Route;

// Autenticación pública
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas con Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Ruta personalizada para activar / desactivar
    Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);

    // Endpoints de usuarios y notas
    Route::apiResource('users', UserController::class);
    Route::apiResource('notes', NoteController::class);
   });