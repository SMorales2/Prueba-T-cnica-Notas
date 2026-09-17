// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// export default function BoardCanvas({ token }) {
//   const [notes, setNotes] = useState([]);
//   const [newTitle, setNewTitle] = useState('');
//   const headers = { Authorization: `Bearer ${token}` };

//   const fetchNotes = async () => {
//     try {
//       const res = await axios.get('http://localhost:8000/api/notes', { headers });
//       setNotes(res.data);
//     } catch (err) {
//       console.error('Error al cargar notas:', err);
//     }
//   };

//   useEffect(() => { fetchNotes(); }, []);

//   const createNote = async (e) => {
//     e.preventDefault();
//     if (!newTitle.trim()) return;
//     await axios.post('http://localhost:8000/api/notes', {
//       title: newTitle, text: '', status: 'Pendiente', position_x: 40, position_y: 40
//     }, { headers });
//     setNewTitle('');
//     fetchNotes();
//   };

//   const updateNote = async (id, data) => {
//     await axios.put(`http://localhost:8000/api/notes/${id}`, data, { headers });
//     fetchNotes();
//   };

//   const deleteNote = async (id) => {
//     await axios.delete(`http://localhost:8000/api/notes/${id}`, { headers });
//     fetchNotes();
//   };

//   const handleDragEnd = (e, note) => {
//     const rect = e.currentTarget.parentElement.getBoundingClientRect();
//     const x = Math.max(10, e.clientX - rect.left - 120);
//     const y = Math.max(10, e.clientY - rect.top - 20);
//     updateNote(note.id, { position_x: x, position_y: y });
//   };

//   return (
//     <div className="p-4 h-[calc(100vh-64px)] flex flex-col bg-slate-100">
//       <form onSubmit={createNote} className="flex gap-3 mb-4 items-center bg-white p-3 rounded-lg shadow-sm border">
//         <input 
//           type="text" 
//           placeholder="Escribe el título del post-it..." 
//           value={newTitle} 
//           onChange={e => setNewTitle(e.target.value)} 
//           className="border rounded px-3 py-1.5 text-sm w-80 outline-indigo-500" 
//         />
//         <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-1.5 rounded text-sm shadow">
//           + Nueva Nota
//         </button>
//       </form>

//       <div 
//         onDragOver={(e) => e.preventDefault()} 
//         className="flex-1 canvas-bg rounded-xl relative overflow-hidden border-2 border-slate-300 shadow-inner"
//       >
//         {notes.map(note => (
//           <div
//             key={note.id}
//             draggable
//             onDragEnd={(e) => handleDragEnd(e, note)}
//             style={{ left: `${note.position_x}px`, top: `${note.position_y}px` }}
//             className="post-it p-3 flex flex-col justify-between cursor-move select-none"
//           >
//             <div>
//               <input
//                 type="text"
//                 defaultValue={note.title}
//                 onBlur={(e) => updateNote(note.id, { title: e.target.value })}
//                 className="font-bold text-slate-800 bg-transparent w-full mb-1 text-sm outline-none border-b border-transparent focus:border-amber-600"
//               />
//               <textarea
//                 defaultValue={note.text}
//                 onBlur={(e) => updateNote(note.id, { text: e.target.value })}
//                 placeholder="Escribe el contenido..."
//                 className="text-xs text-slate-700 bg-transparent w-full resize-none outline-none h-20"
//               />
//             </div>
//             <div className="flex justify-between items-center pt-2 border-t border-amber-300/60 mt-2">
//               <select
//                 value={note.status}
//                 onChange={(e) => updateNote(note.id, { status: e.target.value })}
//                 className="text-xs bg-amber-200 font-semibold text-amber-900 rounded px-1.5 py-0.5 outline-none cursor-pointer"
//               >
//                 <option value="Pendiente">Pendiente</option>
//                 <option value="En curso">En curso</option>
//                 <option value="Hecho">Hecho</option>
//               </select>
//               <button onClick={() => deleteNote(note.id)} className="text-red-600 hover:text-red-800 text-xs font-bold">
//                 Eliminar
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function BoardCanvas({ token }) {
  const [notes, setNotes] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchNotes = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/notes', { headers });
      setNotes(res.data);
    } catch (err) {
      console.error('Error al cargar notas:', err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const createNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await axios.post(
        'http://localhost:8000/api/notes',
        { title: newTitle, text: '', status: 'Pendiente', position_x: 40, position_y: 40 },
        { headers }
      );
      setNotes((prev) => [...prev, res.data]);
      setNewTitle('');
    } catch (err) {
      console.error('Error creando nota:', err);
    }
  };

  // Actualización optimista: Cambia la UI primero, guarda en backend después
  const handleLocalUpdate = (id, fields) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...fields } : n))
    );
  };

  const saveNoteUpdate = async (id, fields) => {
    try {
      await axios.put(`http://localhost:8000/api/notes/${id}`, fields, { headers });
    } catch (err) {
      console.error('Error al guardar actualización:', err);
      fetchNotes(); // Revertir en caso de falla
    }
  };

  const deleteNote = async (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await axios.delete(`http://localhost:8000/api/notes/${id}`, { headers });
    } catch (err) {
      console.error('Error eliminando nota:', err);
      fetchNotes();
    }
  };

  const handleDragEnd = (e, note) => {
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    const x = Math.max(10, Math.round(e.clientX - rect.left - 120));
    const y = Math.max(10, Math.round(e.clientY - rect.top - 20));

    handleLocalUpdate(note.id, { position_x: x, position_y: y });
    saveNoteUpdate(note.id, { position_x: x, position_y: y });
  };

  return (
    <div className="p-4 h-[calc(100vh-64px)] flex flex-col bg-slate-100">
      <form onSubmit={createNote} className="flex gap-3 mb-4 items-center bg-white p-3 rounded-lg shadow-sm border">
        <input
          type="text"
          placeholder="Escribe el título del post-it..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm w-80 outline-indigo-500 text-slate-800"
        />
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-1.5 rounded text-sm shadow transition"
        >
          + Nueva Nota
        </button>
      </form>

      <div
        onDragOver={(e) => e.preventDefault()}
        className="flex-1 canvas-bg rounded-xl relative overflow-hidden border-2 border-slate-300 shadow-inner"
      >
        {notes.map((note) => (
          <div
            key={note.id}
            draggable
            onDragEnd={(e) => handleDragEnd(e, note)}
            style={{ left: `${note.position_x}px`, top: `${note.position_y}px` }}
            className="post-it p-3 flex flex-col justify-between cursor-move select-none"
          >
            <div>
              <input
                type="text"
                value={note.title}
                onChange={(e) => handleLocalUpdate(note.id, { title: e.target.value })}
                onBlur={(e) => saveNoteUpdate(note.id, { title: e.target.value })}
                className="font-bold text-slate-800 bg-transparent w-full mb-1 text-sm outline-none border-b border-transparent focus:border-amber-600"
              />
              <textarea
                value={note.text || ''}
                onChange={(e) => handleLocalUpdate(note.id, { text: e.target.value })}
                onBlur={(e) => saveNoteUpdate(note.id, { text: e.target.value })}
                placeholder="Escribe el contenido..."
                className="text-xs text-slate-700 bg-transparent w-full resize-none outline-none h-20"
              />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-amber-300/60 mt-2">
              <select
                value={note.status}
                onChange={(e) => {
                  const status = e.target.value;
                  handleLocalUpdate(note.id, { status });
                  saveNoteUpdate(note.id, { status });
                }}
                className="text-xs bg-amber-200 font-semibold text-amber-900 rounded px-1.5 py-0.5 outline-none cursor-pointer"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En curso">En curso</option>
                <option value="Hecho">Hecho</option>
              </select>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-600 hover:text-red-800 text-xs font-bold"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}