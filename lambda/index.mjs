import http from 'http';

export const handler = async () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'backend',
      port: 8000,
      path: '/api/internal/metrics',
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'X-Internal-Token': 'secret-token-local'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          resolve({
            statusCode: res.statusCode || 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
              total: parsed.total || 0,
              distribution: parsed.by_status || parsed.distribution || {
                Pendiente: 0,
                'En curso': 0,
                Hecho: 0
              }
            })
          });
        } catch (e) {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ error: 'Error procesando JSON de métricas' })
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