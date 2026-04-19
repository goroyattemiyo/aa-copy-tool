const API = 'https://aa-copy-tool-goroyattemiyos-projects.vercel.app/api';

let presetsCache = [];
let selectedPreset = null;

const LINKS = [
  { name: 'Google AA検索', url: 'https://www.google.com/search?q=AA+アスキーアート' },
  { name: 'Twitter/X AA検索', url: 'https://x.com/search?q=アスキーアート&f=live' },
  { name: 'aahub.org', url: 'https://aahub.org' },
  { name: '5ch AA板', url: 'https://medaka.5ch.net/ascii/' },
];

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'stock') loadStock();
    if (tab.dataset.tab === 'find') renderLinks();
    if (tab.dataset.tab === 'settings') loadPresets();
  });
});

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}

function normalize(str) {
  return str
    .replace(/[\uff61-\uff9f]/g, s => String.fromCharCode(s.charCodeAt(0) + 0x60))
    .toLowerCase();
}

async function initPresets() {
  try {
    const res = await fetch(API + '/presets');
    const data = await res.json();
    presetsCache = data.presets || [];
    renderPresetSelector();
    renderPresetList();
  } catch { presetsCache = []; }
}

function renderPresetSelector() {
  const existing = document.getElementById('presetSelector');
  if (existing) existing.remove();
  const selector = document.createElement('select');
  selector.id = 'presetSelector';
  selector.style.cssText = 'width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:13px;background:#fff;margin-bottom:8px;';
  const none = document.createElement('option');
  none.value = '';
  none.textContent = '補正なし';
  selector.appendChild(none);
  presetsCache.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    selector.appendChild(opt);
  });
  selector.addEventListener('change', () => {
    selectedPreset = presetsCache.find(p => p.id === selector.value) || null;
  });
  const stockScreen = document.getElementById('stock');
  stockScreen.insertBefore(selector, stockScreen.querySelector('.search-box'));
}

function renderPresetList() {
  const container = document.getElementById('presetList');
  container.innerHTML = '';
  if (presetsCache.length === 0) {
    container.innerHTML = '<p class="hint">まだプリセットがありません</p>';
    return;
  }
  presetsCache.forEach(p => {
    const card = document.createElement('div');
    card.className = 'preset-card';
    card.innerHTML = '<div class="preset-name"></div><div class="preset-detail"></div><div class="preset-detail"></div>';
    card.querySelectorAll('div')[0].textContent = p.name;
    card.querySelectorAll('div')[1].textContent = 'URL：' + p.url_pattern;
    card.querySelectorAll('div')[2].textContent = '改行：' + p.newline + ' ／ スペース：' + (p.space === 'full' ? '全角に統一' : p.space === 'half' ? '半角に統一' : '補正しない');
    container.appendChild(card);
  });
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

  const title = document.createElement('div');
  title.className = 'aa-title';
  title.textContent = item.title;

  const tags = document.createElement('div');
  tags.className = 'aa-tags';
  tags.textContent = (item.tags || []).join(' / ');

  const body = document.createElement('div');
  body.className = 'aa-body';
  body.textContent = item.body;

  const actions = document.createElement('div');
  actions.className = 'aa-actions';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.textContent = 'コピー';
  copyBtn.addEventListener('click', async () => {
    const text = applyPreset(item.body, selectedPreset);
    await navigator.clipboard.writeText(text);
    await fetch(API + '/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aa_id: item.id, preset_used: selectedPreset ? selectedPreset.name : null })
    });
    toast(selectedPreset ? 'コピー（' + selectedPreset.name + '補正）' : 'コピーしました');
  });
  actions.appendChild(copyBtn);

  card.appendChild(title);
  card.appendChild(tags);
  card.appendChild(body);
  card.appendChild(actions);
  return card;
}

const BASE = 'https://aa-copy-tool-goroyattemiyos-projects.vercel.app';
let allItems = null;

async function loadAllItems() {
  if (allItems) return allItems;
  const res = await fetch(BASE + '/aa/index.json');
  const index = await res.json();
  const results = await Promise.all(
    index.categories.map(cat =>
      fetch(BASE + '/aa/' + cat.file).then(r => r.json())
    )
  );
  allItems = results.flatMap(r => r.items);
  return allItems;
}

async function loadStock(q) {
  const container = document.getElementById('stockList');
  container.innerHTML = '<p style="color:#888;font-size:13px">読み込み中...</p>';
  try {
    let items = await loadAllItems();
    if (q) {
      const nq = normalize(q);
      items = items.filter(i =>
        normalize(i.title).includes(nq) ||
        normalize(i.body).includes(nq) ||
        (i.tags || []).some(t => normalize(t).includes(nq))
      );
    }
    items = [...items].sort((a, b) => (b.use_count || 0) - (a.use_count || 0));
    container.innerHTML = '';
    if (items.length === 0) {
      container.innerHTML = '<p style="color:#888;font-size:13px">見つかりませんでした</p>';
      return;
    }
    items.slice(0, 100).forEach(item => container.appendChild(renderCard(item)));
    if (items.length > 100) {
      const more = document.createElement('p');
      more.style.cssText = 'color:#888;font-size:13px;text-align:center';
      more.textContent = `他 ${items.length - 100} 件 — 検索で絞り込んでください`;
      container.appendChild(more);
    }
  } catch(e) {
    container.innerHTML = '<p style="color:red;font-size:13px">読み込みエラー: ' + e.message + '</p>';
  }
}

document.getElementById('searchBtn').addEventListener('click', () => {
  const q = document.getElementById('searchInput').value.trim();
  loadStock(q);
});

document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('searchBtn').click();
});

function renderLinks() {
  const container = document.getElementById('linkList');
  container.innerHTML = '';
  LINKS.forEach(link => {
    const btn = document.createElement('a');
    btn.className = 'link-btn';
    btn.textContent = link.name;
    btn.href = link.url;
    btn.target = '_blank';
    container.appendChild(btn);
  });
}

document.getElementById('pasteBtn').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (!text.trim()) { toast('クリップボードが空です'); return; }
    document.getElementById('pastePreview').textContent = text;
    document.getElementById('pasteForm').style.display = 'block';
    document.getElementById('pasteTitle').focus();
  } catch {
    toast('クリップボードの読み取りに失敗しました');
  }
});

document.getElementById('pasteStockBtn').addEventListener('click', async () => {
  const title = document.getElementById('pasteTitle').value.trim();
  const body = document.getElementById('pastePreview').textContent;
  const tagsRaw = document.getElementById('pasteTags').value.trim();
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
  if (!title) { toast('タイトルを入力してください'); return; }
  await fetch(API + '/stock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body, tags })
  });
  document.getElementById('pasteTitle').value = '';
  document.getElementById('pasteTags').value = '';
  document.getElementById('pastePreview').textContent = '';
  document.getElementById('pasteForm').style.display = 'none';
  toast('ストックに追加しました');
});

async function loadPresets() {
  try {
    const res = await fetch(API + '/presets');
    const data = await res.json();
    presetsCache = data.presets || [];
    renderPresetList();
    renderPresetSelector();
  } catch { presetsCache = []; }
}

document.getElementById('addPresetBtn').addEventListener('click', async () => {
  const name = document.getElementById('presetName').value.trim();
  const url_pattern = document.getElementById('presetPattern').value.trim();
  const newline = document.getElementById('presetNewline').value;
  const space = document.getElementById('presetSpace').value;
  if (!name || !url_pattern) return;
  await fetch(API + '/presets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, url_pattern, newline, space })
  });
  document.getElementById('presetName').value = '';
  document.getElementById('presetPattern').value = '';
  toast('プリセットを追加しました');
  await loadPresets();
});

initPresets();
loadStock();

