export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1. Consultar partidos del Mundial a API-Football
  let footballContext = '';
  try {
    const fixturesRes = await fetch(
      'https://v3.football.api-sports.io/leagues?name=FIFA%20World%20Cup&type=Cup',
      {
        headers: {
          'x-apisports-key': process.env.API_FOOTBALL_KEY
        }
      }
    );
    const fixturesData = await fixturesRes.json();
   footballContext = JSON.stringify(fixturesData.response?.slice(0, 3));
  } catch (e) {
    footballContext = 'No se pudieron cargar los partidos en este momento.';
  }

  // 2. Inyectar datos reales en el system prompt
  const systemWithData = `${req.body.system}

DATOS EN VIVO DE API-FOOTBALL (próximos y recientes partidos del Mundial 2026):
${footballContext}`;

  // 3. Llamar a Claude con el contexto actualizado
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      ...req.body,
      system: systemWithData
    })
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
