const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  const fullPrompt = '「' + prompt + '」をテーマにした日本語アスキーアート（AA）を5件生成してください。\n\n【条件】\n- 2ch/5ch掲示板文化で使われるスタイルのAA\n- 全角文字・記号・顔文字を使ったテキストアート\n- bodyの改行は\\nで表現\n- 1行顔文字でもOK\n\nJSON配列のみで返してください（説明文・コードブロック不要）：\n[{"title":"タイトル","body":"AAの内容","tags":["タグ1","タグ2"]}]';

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
    const clean = raw.replace(/^[\s\S]*?(\[[\s\S]*\])[\s\S]*$/, '').trim();
    const items = JSON.parse(clean);
    return res.status(200).json({ items });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
