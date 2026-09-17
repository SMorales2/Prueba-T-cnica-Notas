<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    // Listar todas las notas ordenadas por ID
    public function index()
    {
        $notes = Note::select('id', 'title', 'text', 'status', 'position_x', 'position_y', 'user_id', 'updated_at')
            ->with('user:id,name')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json($notes);
    }

    // Crear una nota nueva
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'text' => 'nullable|string',
            'status' => 'in:Pendiente,En curso,Hecho',
            'position_x' => 'numeric',
            'position_y' => 'numeric',
        ]);

        $note = Note::create([
            'title' => $validated['title'],
            'text' => $validated['text'] ?? '',
            'status' => $validated['status'] ?? 'Pendiente',
            'position_x' => $validated['position_x'] ?? 40,
            'position_y' => $validated['position_y'] ?? 40,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($note->load('user:id,name'), 201);
    }

    // Actualizar nota sin recargar todo el lienzo
    public function update(Request $request, Note $note)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'text' => 'nullable|string',
            'status' => 'sometimes|in:Pendiente,En curso,Hecho',
            'position_x' => 'sometimes|numeric',
            'position_y' => 'sometimes|numeric',
        ]);

        $note->update($validated);

        return response()->json($note->load('user:id,name'));
    }

    // Eliminar una nota
    public function destroy(Note $note)
    {
        $note->delete();

        return response()->json(['message' => 'Nota eliminada correctamente']);
    }

    Public function metrics(Request $request)
    {
        // Validar token secreto interno para seguridad entre contenedores
        $internalToken = $request->header('X-Internal-Token');
        if ($internalToken !== 'secret-token-local') {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $total = Note::count();
        $distribution = [
            'Pendiente' => Note::where('status', 'Pendiente')->count(),
            'En curso'  => Note::where('status', 'En curso')->count(),
            'Hecho'     => Note::where('status', 'Hecho')->count(),
        ];

        return response()->json([
            'total' => $total,
            'distribution' => $distribution
        ]);
    }
}