<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Método privado para verificar que el usuario autenticado sea Administrador.
     */
    private function authorizeAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Acceso denegado. Se requieren permisos de administrador.');
        }
    }

    // Listar todos los usuarios
    public function index(Request $request)
    {
        $this->authorizeAdmin($request);

        $users = User::select('id', 'name', 'email', 'role', 'is_active', 'created_at')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($users);
    }

    // Crear un nuevo usuario
    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,user',
            'is_active' => 'nullable|boolean'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'user' => $user
        ], 201);
    }

    // Editar un usuario existente
    public function update(Request $request, User $user)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|in:admin,user',
            'password' => 'nullable|string|min:6',
            'is_active' => 'required|boolean'
        ]);

        // REGLA DE NEGOCIO: Proteger al último admin activo
        if ($user->role === 'admin' && $user->is_active) {
            $willBeInactiveOrUser = (!$validated['is_active'] || $validated['role'] !== 'admin');
            
            if ($willBeInactiveOrUser) {
                $activeAdminCount = User::where('role', 'admin')->where('is_active', true)->count();
                if ($activeAdminCount <= 1) {
                    return response()->json([
                        'message' => 'No se puede desactivar ni cambiar el rol del único administrador activo.'
                    ], 422);
                }
            }
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];
        $user->is_active = $validated['is_active'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'user' => $user
        ]);
    }

    // Alternar estado activo / inactivo
    public function toggleStatus(Request $request, User $user)
    {
        $this->authorizeAdmin($request);

        // REGLA DE NEGOCIO: Si el admin está activo y se intenta desactivar
        if ($user->role === 'admin' && $user->is_active) {
            $activeAdminCount = User::where('role', 'admin')->where('is_active', true)->count();
            if ($activeAdminCount <= 1) {
                return response()->json([
                    'message' => 'Debe conservarse al menos un administrador activo en el sistema.'
                ], 422);
            }
        }

        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json([
            'message' => 'Estado del usuario actualizado',
            'user' => $user
        ]);
    }
}