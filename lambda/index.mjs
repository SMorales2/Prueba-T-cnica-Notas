export const handler = async (event) => {
  try {
    // Si la Lambda consulta el backend de Laravel para obtener métricas reales:
    // const response = await fetch('http://fixlat_backend:8000/api/notes');
    // const notes = await response.json();

    const metrics = {
      total_notes: 0,
      by_status: {
        pendiente: 0,
        en_curso: 0,
        hecho: 0
      }
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(metrics)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al procesar métricas en Lambda' })
    };
  }
};