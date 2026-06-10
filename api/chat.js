export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1. Consultar partidos del Mundial a API-Football
  let footballContext = '';
  try {
    const fixturesRes = await fetch(
      'https://v3.football.api-sports.io/fixtures?league=1&season=2026&next=10',
      {
        headers: {
          'x-apisports-key': process.env.API_FOOTBALL_KEY
        }
      }
    );
    const fixturesData = await fixturesRes.json();
    const fixtures = fixturesData.response || [];

    footballContext = fixtures.map(f => {
      const home = f.teams.home.name;
      const away = f.teams.away.name;
      const date = new Date(f.fixture.date).toLocaleString('es-CO', { timeZone: 'America/Bogota' });
      const status = f.fixture.status.long;
      const homeGoals = f.goals.home ?? '-';
      const awayGoals = f.goals.away ?? '-';
      return `${date} | ${home} ${homeGoals}-${awayGoals} ${away} | ${status}`;
    }).join('\n');

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
