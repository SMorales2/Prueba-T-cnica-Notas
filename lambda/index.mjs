import http from 'http';

export const handler = async () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'backend',
      port: 8000,
      path: '/api/notes',
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          // Soporta respuesta en array directo o envoltorio { data: [...] }
          let list = [];
          if (Array.isArray(parsed)) {
            list = parsed;
          } else if (parsed && Array.isArray(parsed.data)) {
            list = parsed.data;
          }

          const pendiente = list.filter((n) => n.status === 'Pendiente').length;
          const enCurso = list.filter((n) => n.status === 'En curso').length;
          const hecho = list.filter((n) => n.status === 'Hecho' || n.status === 'Completada').length;

          resolve({
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
              total: list.length,
              distribution: {
                Pendiente: pendiente,
                'En curso': enCurso,
                Hecho: hecho
              }
            })
          });
        } catch (e) {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ error: 'Error procesando JSON de notas' })
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: 'Error de conexión con el backend', detail: err.message })
      });
    });

    req.end();
  });
};