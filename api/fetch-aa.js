const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });

  try {
    const pageRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AA-Copy-Tool/1.0)' }
    });
    if (!pageRes.ok) throw new Error(`fetch failed: ${pageRes.status}`);
    const html = await pageRes.text();

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .substring(0, 8000);

    const prompt = `以下のテキストはAAまとめサイトのページ内容です。
アスキーアート（AA）のブロックをすべて抽出してください。
各AAに適切なタイトルとタグをつけてください。

ルール：
- AAとは複数行にわたる文字アート・顔文字・テキスト絵のことです
- 1行だけの顔文字も含めてください
- 説明文・ナビゲーション・広告テキストは除外してください
- タグは["キャラ","2ch","顔文字"]などの分類をつけてください

必ずJSON配列のみで返してください（前後の説明文不要）：
[{"title":"タイトル","body":"AAの内容（改行は\\nで）","tags":["タグ1","タグ2"]}]

テキスト：
${text}`;

    const geminiRes = await fetch(`${GEMINI_API}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
      })
    });

    const geminiData = await geminiRes.json();
    const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const clean = raw.replace(/```json|```/g, '').trim();
    const items = JSON.parse(clean);

    return res.status(200).json({ items });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
