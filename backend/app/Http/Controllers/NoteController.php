<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    // Listar todas las notas del tablero compartido
    public function index()
    {
        $notes = Note::with('user:id,name')->get();
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
            'position_x' => $validated['position_x'] ?? 0,
            'position_y' => $validated['position_y'] ?? 0,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Nota creada exitosamente',
            'note' => $note->load('user:id,name')
        ], 201);
    }

    // Actualizar nota (útil para mover de posición, cambiar estado o texto)
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

        return response()->json([
            'message' => 'Nota actualizada correctamente',
            'note' => $note->load('user:id,name')
        ]);
    }

    // Eliminar una nota
    public function destroy(Note $note)
    {
        $note->delete();

        return response()->json([
            'message' => 'Nota eliminada correctamente'
        ]);
    }
}