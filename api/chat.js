export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let footballContext = '';
  try {
    const r = await fetch(
      'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'
    );
    const data = await r.json();

    // Partidos de hoy y recientes
    const today = new Date().toISOString().slice(0, 10);
    const matches = [];

    for (const round of data.rounds || []) {
      for (const match of round.matches || []) {
        const matchDate = match.date?.slice(0, 10);
        if (matchDate >= today.slice(0, 7)) {
          matches.push(
            `${match.date} | ${match.team1?.name} ${match.score1 ?? '?'}-${match.score2 ?? '?'} ${match.team2?.name}`
          );
        }
      }
    }

    footballContext = matches.slice(0, 20).join('\n') || 'Sin partidos próximos disponibles.';

  } catch (e) {
    footballContext = `Error cargando datos: ${e.message}`;
  }

  const systemWithData = `${req.body.system}

DATOS REALES DEL MUNDIAL 2026 (fuente oficial):
${footballContext}`;

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
