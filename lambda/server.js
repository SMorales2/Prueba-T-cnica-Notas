import express from 'express';
import cors from 'cors';
import { handler } from './index.mjs';

const app = express();
app.use(cors());

app.get('/metrics', async (req, res) => {
  try {
    const result = await handler();
    const data = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    res.status(result.statusCode || 200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log('Servidor Lambda ejecutándose en puerto 3001');
});