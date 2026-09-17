import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ total: 0, distribution: { Pendiente: 0, 'En curso': 0, Hecho: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Petición directa a la Lambda local
    axios.get('http://localhost:3001/metrics')
      .then(res => setMetrics(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Cargando métricas desde Lambda...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard de Métricas (AWS Lambda)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded shadow border-l-4 border-indigo-500">
          <p className="text-xs uppercase text-slate-500 font-bold">Total Notas</p>
          <p className="text-3xl font-bold text-slate-800">{metrics.total}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-amber-400">
          <p className="text-xs uppercase text-slate-500 font-bold">Pendientes</p>
          <p className="text-3xl font-bold text-amber-600">{metrics.distribution.Pendiente}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-sky-400">
          <p className="text-xs uppercase text-slate-500 font-bold">En Curso</p>
          <p className="text-3xl font-bold text-sky-600">{metrics.distribution['En curso']}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-emerald-400">
          <p className="text-xs uppercase text-slate-500 font-bold">Hechas</p>
          <p className="text-3xl font-bold text-emerald-600">{metrics.distribution.Hecho}</p>
        </div>
      </div>
    </div>
  );
}