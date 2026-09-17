import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserManagement({ token }) {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', is_active: true });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/users', { headers });
      setUsers(res.data);
    } catch (err) {
      setError('No se pudo obtener la lista de usuarios.');
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      if (editingId) {
        await axios.put(`http://localhost:8000/api/users/${editingId}`, formData, { headers });
        setSuccess('Usuario actualizado correctamente');
      } else {
        await axios.post('http://localhost:8000/api/users', formData, { headers });
        setSuccess('Usuario creado correctamente');
      }
      setFormData({ name: '', email: '', password: '', role: 'user', is_active: true });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error en la operación');
    }
  };

  const toggleStatus = async (user) => {
    setError(''); setSuccess('');
    try {
      await axios.patch(`http://localhost:8000/api/users/${user.id}/toggle-status`, {}, { headers });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operación no permitida');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Administración de Usuarios</h2>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm font-medium">{error}</div>}
      {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded mb-4 text-sm font-medium">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Nombre</label>
          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="border p-1.5 rounded text-sm w-48" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="border p-1.5 rounded text-sm w-48" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Contraseña</label>
          <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="border p-1.5 rounded text-sm w-36" placeholder={editingId ? 'Opcional' : ''} required={!editingId} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Rol</label>
          <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="border p-1.5 rounded text-sm">
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-indigo-700 transition">
          {editingId ? 'Guardar Cambios' : 'Crear Usuario'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 border-b text-xs font-bold uppercase text-slate-600">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-slate-800">{u.name}</td>
                <td className="p-3 text-slate-600">{u.email}</td>
                <td className="p-3"><span className="uppercase text-xs font-bold px-2 py-0.5 rounded bg-slate-200">{u.role}</span></td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-3 space-x-3">
                  <button onClick={() => { setEditingId(u.id); setFormData({ name: u.name, email: u.email, password: '', role: u.role, is_active: u.is_active }); }} className="text-indigo-600 hover:underline font-bold text-xs">Editar</button>
                  <button onClick={() => toggleStatus(u)} className="text-slate-600 hover:underline font-bold text-xs">
                    {u.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}