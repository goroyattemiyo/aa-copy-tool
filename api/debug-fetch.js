export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { url } = req.body;
  try {
    const pageRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AA-Copy-Tool/1.0)' }
    });
    const html = await pageRes.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .substring(0, 2000);
    return res.status(200).json({ status: pageRes.status, text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
