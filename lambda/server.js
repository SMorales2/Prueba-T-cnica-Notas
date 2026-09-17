import express from 'express';
import cors from 'cors';
import { handler } from './index.mjs';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get(['/', '/metrics'], async (req, res) => {
  try {
    if (typeof handler === 'function') {
      const result = await handler();
      const data = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
      return res.status(result.statusCode || 200).json(data);
    }

    res.json({
      total_notes: 0,
      by_status: {
        pendiente: 0,
        en_curso: 0,
        hecho: 0
      }
    });
  } catch (error) {
    console.error('Error procesando métricas en Lambda:', error);
    res.status(500).json({ error: 'Error al procesar métricas en Lambda' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servicio Lambda emulado corriendo en http://0.0.0.0:${PORT}`);
});