const API = 'https://aa-copy-tool-goroyattemiyos-projects.vercel.app/api';

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'stock') loadStock();
  });
});

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}

async function getActiveTabUrl() {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      resolve(tabs[0]?.url || '');
    });
  });
}

async function detectPreset(url) {
  try {
    const res = await fetch(`${API}/presets`);
    const data = await res.json();
    return data.presets.find(p => new RegExp(p.url_pattern).test(url)) || null;
  } catch { return null; }
}

function applyPreset(text, preset) {
  if (!preset) return text;
  let result = text;
  if (preset.newline === 'LF') result = result.replace(/\r\n/g, '\n');
  if (preset.newline === 'CRLF') result = result.replace(/\n/g, '\r\n');
  if (preset.space === 'full') result = result.replace(/ /g, '　');
  if (preset.space === 'half') result = result.replace(/　/g, ' ');
  return result;
}

function renderCard(item) {
  const card = document.createElement('div');
  card.className = 'aa-card';
  card.innerHTML = `
    <div class="aa-title">${item.title}</div>
    <div class="aa-tags">${(item.tags || []).join(' / ')}</div>
    <div class="aa-body">${item.body}</div>
    <button class="copy-btn">コピー</button>
  `;
  card.querySelector('.copy-btn').addEventListener('click', async () => {
    const url = await getActiveTabUrl();
    const preset = await detectPreset(url);
    const text = applyPreset(item.body, preset);
    await navigator.clipboard.writeText(text);
    await fetch(`${API}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aa_id: item.id, preset_used: preset?.name || null })
    });
    toast('コピーしました');
  });
  return card;
}

document.getElementById('searchBtn').addEventListener('click', async () => {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  const res = await fetch(`${API}/stock`);
  const data = await res.json();
  const results = data.items.filter(i =>
    i.title.includes(q) || (i.tags || []).some(t => t.includes(q))
  );
  const container = document.getElementById('searchResults');
  container.innerHTML = '';
  if (results.length === 0) {
    container.innerHTML = '<p style="color:#888;font-size:12px">見つかりませんでした</p>';
    return;
  }
  results.forEach(item => container.appendChild(renderCard(item)));
});

document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('searchBtn').click();
});

async function loadStock() {
  const res = await fetch(`${API}/stock`);
  const data = await res.json();
  const container = document.getElementById('stockList');
  container.innerHTML = '';
  data.items
    .sort((a, b) => b.use_count - a.use_count)
    .forEach(item => container.appendChild(renderCard(item)));
}
