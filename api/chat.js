export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let footballContext = '';
  try {
    const r = await fetch('https://worldcup26.ir/get/games');
    const data = await r.json();
    const games = Array.isArray(data) ? data : (data.games || data.matches || []);
    footballContext = JSON.stringify(games[0]);
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
