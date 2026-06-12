export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let footballContext = '';
  try {
    const r = await fetch('https://worldcup26.ir/get/games');
    const data = await r.json();
    const games = data.games || [];

    // Separar partidos terminados, en curso y próximos
    const finished = games.filter(g => g.finished === 'TRUE');
    const upcoming = games.filter(g => g.finished === 'FALSE' && g.time_elapsed === 'notstarted').slice(0, 10);
    const live = games.filter(g => g.finished === 'FALSE' && g.time_elapsed !== 'notstarted');

    const formatGame = g => {
      const scorers = g.home_scorers && g.home_scorers !== 'null' 
        ? ` (${g.home_scorers} / ${g.away_scorers})` : '';
      return `${g.local_date} | Grupo ${g.group} | ${g.home_team_name_en} ${g.home_score}-${g.away_score} ${g.away_team_name_en}${scorers} | ${g.time_elapsed}`;
    };

    footballContext = [
      live.length ? `EN VIVO:\n${live.map(formatGame).join('\n')}` : '',
      finished.length ? `RESULTADOS:\n${finished.map(formatGame).join('\n')}` : '',
      upcoming.length ? `PRÓXIMOS PARTIDOS:\n${upcoming.map(formatGame).join('\n')}` : ''
    ].filter(Boolean).join('\n\n');

  } catch (e) {
    footballContext = `Error: ${e.message}`;
  }

  const systemWithData = `${req.body.system}

DATOS REALES DEL MUNDIAL 2026:
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
