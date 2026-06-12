export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1. Consultar partidos del Mundial a API-Football
  let footballContext = '';
  try {
    const fixturesRes = await fetch(
      'https://v3.football.api-sports.io/fixtures?league=1&season=2026&from=2026-06-11&to=2026-06-14',
      {
        headers: {
          'x-apisports-key': process.env.API_FOOTBALL_KEY
        }
      }
    );
    const fixturesData = await fixturesRes.json();
   const raw = JSON.stringify(fixturesData).slice(0, 2000);
footballContext = `RESPUESTA CRUDA API-FOOTBALL: ${raw}`;
  } catch (e) {
   footballContext = `ERROR API-Football: ${e.message}`;  }

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
