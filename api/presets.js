import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const path = 'data/aa-presets.json';

async function getFile() {
  const { data } = await octokit.repos.getContent({ owner, repo, path });
  const content = Buffer.from(data.content, 'base64').toString('utf8');
  return { json: JSON.parse(content), sha: data.sha };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { json } = await getFile();
      return res.status(200).json(json);
    }

    if (req.method === 'POST') {
      const { json, sha } = await getFile();
      const item = { ...req.body, id: crypto.randomUUID() };
      json.presets.push(item);
      await octokit.repos.createOrUpdateFileContents({
        owner, repo, path, sha,
        message: `add preset: ${item.name}`,
        content: Buffer.from(JSON.stringify(json, null, 2)).toString('base64'),
      });
      return res.status(201).json(item);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
