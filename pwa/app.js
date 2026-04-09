const API = 'https://aa-copy-tool-goroyattemiyos-projects.vercel.app/api';

let presetsCache = [];
let selectedPreset = null;

// タブ切り替え
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'stock') loadStock();
    if (tab.dataset.tab === 'settings') loadPresets();
  });
});

// トースト
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}

// プリセット初期ロード
async function initPresets() {
  try {
    const res = await fetch(`${API}/presets`);
    const data = await res.json();
    presetsCache = data.presets || [];
    renderPresetSelector();
    renderPresetList();
  } catch { presetsCache = []; }
}

// 検索画面にプリセットセレクターを追加
function renderPresetSelector() {
  const existing = document.getElementById('presetSelector');
  if (existing) existing.remove();
  const selector = document.createElement('select');
  selector.id = 'presetSelector';
  selector.style.cssText = 'width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:13px;background:#fff;';
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
  const searchScreen = document.getElementById('search');
  searchScreen.insertBefore(selector, searchScreen.querySelector('.search-box').nextSibling);
}

// プリセット一覧を描画
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
    card.innerHTML = `
      <div class="preset-name">${p.name}</div>
      <div class="preset-detail">URL：${p.url_pattern}</div>
      <div class="preset-detail">改行：${p.newline} ／ スペース：${p.space === 'full' ? '全角に統一' : p.space === 'half' ? '半角に統一' : '補正しない'}</div>
    `;
    container.appendChild(card);
  });
}

// 補正適用
function applyPreset(text, preset) {
  if (!preset) return text;
  let result = text;
  if (preset.newline === 'LF') result = result.replace(/\r\n/g, '\n');
  if (preset.newline === 'CRLF') result = result.replace(/\n/g, '\r\n');
  if (preset.space === 'full') result = result.replace(/ /g, '　');
  if (preset.space === 'half') result = result.replace(/　/g, ' ');
  return result;
}

// AAカード生成
function renderCard(item, showStock = true) {
  const card = document.createElement('div');
  card.className = 'aa-card';
  card.innerHTML = `
    <div class="aa-title">${item.title}</div>
    <div class="aa-tags">${(item.tags || []).join(' / ')}</div>
    <div class="aa-body">${item.body}</div>
    <div class="aa-actions">
      <button class="copy-btn">コピー</button>
      ${showStock ? `<button class="stock-btn">ストック</button>` : ''}
    </div>
  `;
  card.querySelector('.copy-btn').addEventListener('click', async () => {
    const text = applyPreset(item.body, selectedPreset);
    await navigator.clipboard.writeText(text);
    await fetch(`${API}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aa_id: item.id, preset_used: selectedPreset?.name || null })
    });
    toast(selectedPreset ? `コピー（${selectedPreset.name}補正）` : 'コピーしました');
  });
  if (showStock) {
    card.querySelector('.stock-btn').addEventListener('click', async () => {
      await fetch(`${API}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.title, body: item.body, tags: item.tags })
      });
      toast('ストックしました');
    });
  }
  return card;
}

// 検索
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
    container.innerHTML = '<p style="color:#888;font-size:13px">見つかりませんでした</p>';
    return;
  }
  results.forEach(item => container.appendChild(renderCard(item)));
});

document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('searchBtn').click();
});

// ストック一覧
async function loadStock() {
  const res = await fetch(`${API}/stock`);
  const data = await res.json();
  const sort = document.getElementById('sortSelect').value;
  const tag = document.getElementById('tagFilter').value.trim();
  let items = [...data.items];
  if (tag) items = items.filter(i => (i.tags || []).includes(tag));
  items.sort((a, b) => sort === 'use_count' ? b.use_count - a.use_count : b.created_at.localeCompare(a.created_at));
  const container = document.getElementById('stockList');
  container.innerHTML = '';
  items.forEach(item => container.appendChild(renderCard(item, false)));
}

document.getElementById('sortSelect').addEventListener('change', loadStock);
document.getElementById('tagFilter').addEventListener('input', loadStock);

// プリセット一覧ロード
async function loadPresets() {
  try {
    const res = await fetch(`${API}/presets`);
    const data = await res.json();
    presetsCache = data.presets || [];
    renderPresetList();
    renderPresetSelector();
  } catch { presetsCache = []; }
}

// プリセット追加
document.getElementById('addPresetBtn').addEventListener('click', async () => {
  const name = document.getElementById('presetName').value.trim();
  const url_pattern = document.getElementById('presetPattern').value.trim();
  const newline = document.getElementById('presetNewline').value;
  const space = document.getElementById('presetSpace').value;
  if (!name || !url_pattern) return;
  await fetch(`${API}/presets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, url_pattern, newline, space })
  });
  document.getElementById('presetName').value = '';
  document.getElementById('presetPattern').value = '';
  toast('プリセットを追加しました');
  await loadPresets();
  document.getElementById('presetList').scrollIntoView({ behavior: 'smooth' });
});

// 初期化
initPresets();
