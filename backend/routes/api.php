<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;




// Rutas públicas (permite a Lambda consultar las notas sin token)
Route::post('/login', [AuthController::class, 'login']);
Route::get('/notes', [NoteController::class, 'index']);
Route::get('/internal/metrics', [NoteController::class, 'metrics']);

// Rutas protegidas por Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Operaciones de escritura/eliminación protegidas
    Route::apiResource('notes', NoteController::class)->except(['index']);

    Route::middleware('can:admin-only')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
    });
});