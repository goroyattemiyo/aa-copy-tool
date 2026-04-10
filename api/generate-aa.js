const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  const fullPrompt = '「' + prompt + '」をテーマにした日本語アスキーアート（AA）を3件生成してください。\n\n【良い例】\n{"title":"モナー","body":" \u2227_\u2227\n(\u3000\u00b4\u2200\uff40)\n(\u3000\u3000\u3000\u3000)","tags":["\u30ad\u30e3\u30e9"]}\n{"title":"\u30b7\u30e7\u30dc\u30fc\u30f3","body":"(\u00b4\u30fb\u03c9\u30fb\uff40)","tags":["\u9854\u6587\u5b57"]}\n\n【ルール】\n- 全角文字・記号を使う\n- 線がそろっていてきれいに見えるもの\n- 崩れた記号の羅列はNG\n- bodyの改行は\\nで表現\n\nJSON配列のみで返してください：\n[{"title":"タイトル","body":"AAの内容","tags":["タグ"]}]';

  try {
    const geminiRes = await fetch(GEMINI_API + '?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
      }),
    });

    const data = await geminiRes.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf(']');
    const clean = (start !== -1 && end !== -1) ? raw.slice(start, end + 1) : '[]';
    let items = [];
    try { items = JSON.parse(clean); } catch(e) {}
    return res.status(200).json({ items });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
