import React, { useState } from 'react';
import Login from './components/Login';
import BoardCanvas from './components/BoardCanvas';
import UserManagement from './components/UserManagement';
import Dashboard from './components/Dashboard';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [activeTab, setActiveTab] = useState('board');

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center shadow">
        <h1 className="font-bold text-lg">Portal de Equipo</h1>
        <div className="flex gap-4 text-sm font-medium items-center">
          <button
            onClick={() => setActiveTab('board')}
            className={`hover:text-indigo-400 ${activeTab === 'board' ? 'text-indigo-400 border-b-2 border-indigo-400' : ''}`}
          >
            Tablero
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`hover:text-indigo-400 ${activeTab === 'dashboard' ? 'text-indigo-400 border-b-2 border-indigo-400' : ''}`}
          >
            Dashboard
          </button>
          {user.role === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`hover:text-indigo-400 ${activeTab === 'users' ? 'text-indigo-400 border-b-2 border-indigo-400' : ''}`}
            >
              Usuarios
            </button>
          )}
          <span className="text-slate-400 text-xs pl-4 border-l border-slate-700">
            {user.name} ({user.role})
          </span>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1.5 rounded">
            Salir
          </button>
        </div>
      </nav>

      <main className="flex-1">
        {activeTab === 'board' && <BoardCanvas token={token} />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'users' && user.role === 'admin' && <UserManagement token={token} />}
      </main>
    </div>
  );
}