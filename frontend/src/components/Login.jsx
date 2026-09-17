import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@fixlat.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:8000/api/login', { email, password });
      onLoginSuccess(res.data.access_token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Error de autenticación');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Iniciar Sesión</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full border rounded p-2 text-sm focus:outline-indigo-500" 
            required 
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full border rounded p-2 text-sm focus:outline-indigo-500" 
            required 
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700">
          Entrar
        </button>
      </form>
    </div>
  );
}