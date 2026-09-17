// lambda/index.mjs
import http from 'http';

export const handler = async (event) => {
  return new Promise((resolve) => {
    // Solicitud a la API de Laravel dentro de la red Docker
    const options = {
      hostname: process.env.BACKEND_HOST || 'backend',
      port: 8000,
      path: '/api/notes',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const notes = JSON.parse(data);
          const total = Array.isArray(notes) ? notes.length : 0;

          const distribution = {
            Pendiente: notes.filter((n) => n.status === 'Pendiente').length,
            'En curso': notes.filter((n) => n.status === 'En curso').length,
            Hecho: notes.filter((n) => n.status === 'Hecho').length,
          };

          resolve({
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            },
            body: JSON.stringify({ total, distribution }),
          });
        } catch (err) {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ error: 'Error parseando notas', details: err.message }),
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: 'Error de conexión con la API', details: err.message }),
      });
    });

    req.end();
  });
};