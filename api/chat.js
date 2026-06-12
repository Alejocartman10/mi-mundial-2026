const r = await fetch('https://worldcup26.ir/get/games');
const data = await r.json();

const matches = (Array.isArray(data) ? data : data.games || data.matches || [])
  .slice(0, 20)
  .map(m => `${m.date || m.time || ''} | ${m.home_team || m.team1 || ''} ${m.home_score ?? '?'}-${m.away_score ?? '?'} ${m.away_team || m.team2 || ''}`)
  .join('\n');

footballContext = matches || 'Sin datos disponibles.';
