// lambda/server.js
import http from 'http';
import { handler } from './index.mjs';

const PORT = 3001;

const server = http.createServer(async (req, res) => {
    if (req.url === '/metrics' && req.method === 'GET') {
        const result = await handler({});
        res.writeHead(result.statusCode, result.headers);
        res.end(result.body);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Ruta no encontrada en Lambda local' }));
    }
});

server.listen(PORT, () => {
    console.log(`Lambda local escuchando en el puerto ${PORT}`);
});