const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  const fullPrompt = 'catをテーマにした日本語AAを3件生成してください。JSON配列のみで返してください：[{"title":"タイトル","body":"AA","tags":["タグ"]}]';

  try {
    const geminiRes = await fetch(GEMINI_API + '?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature: 0.9 },
      }),
    });

    const data = await geminiRes.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf(']');
    const clean = (start !== -1 && end !== -1) ? raw.slice(start, end + 1) : '[]';
    let items = [];
    try { items = JSON.parse(clean); } catch(e) {}
    return res.status(200).json({ items, raw });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
