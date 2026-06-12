export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let footballContext = '';
  try {
    const r = await fetch('https://worldcup26.ir/get/games');
    const data = await r.json();
    const games = Array.isArray(data) ? data : (data.games || data.matches || []);
    
    footballContext = games.slice(0, 30).map(m => 
      `${m.date || m.time || ''} | ${m.home_team || m.team1 || ''} ${m.home_score ?? '?'}-${m.away_score ?? '?'} ${m.away_team || m.team2 || ''} | ${m.status || m.state || ''}`
    ).join('\n') || 'Sin datos disponibles.';

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
