(function() {
  if (document.getElementById('aa-copy-tool-btn')) return;

  const API = 'https://aa-copy-tool-goroyattemiyos-projects.vercel.app/api';

  const btn = document.createElement('button');
  btn.id = 'aa-copy-tool-btn';
  btn.textContent = '📥 全AAをストックに追加';
  btn.style.cssText = [
    'position:fixed',
    'bottom:20px',
    'right:20px',
    'z-index:99999',
    'background:#22c55e',
    'color:white',
    'border:none',
    'border-radius:8px',
    'padding:10px 16px',
    'font-size:14px',
    'font-family:sans-serif',
    'cursor:pointer',
    'box-shadow:0 2px 8px rgba(0,0,0,0.3)'
  ].join(';');
  document.body.appendChild(btn);

  function toast(msg, color) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = [
      'position:fixed',
      'bottom:70px',
      'right:20px',
      'z-index:99999',
      'background:' + (color || '#22c55e'),
      'color:white',
      'border-radius:6px',
      'padding:8px 14px',
      'font-size:13px',
      'font-family:sans-serif',
      'box-shadow:0 2px 6px rgba(0,0,0,0.2)'
    ].join(';');
    document.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 3000);
  }

  btn.addEventListener('click', async function() {
    const title = (document.querySelector('h1') || {}).textContent;
    const pageTitle = title ? title.trim() : 'aahub';
    const aas = Array.from(document.querySelectorAll('.u-aa'))
      .map(function(el) { return el.innerText; })
      .filter(function(t) { return t.trim(); });

    if (aas.length === 0) {
      toast('AAが見つかりませんでした', '#ef4444');
      return;
    }

    btn.textContent = '⏳ 追加中...';
    btn.disabled = true;

    let success = 0, fail = 0;
    for (const body of aas) {
      try {
        const res = await fetch(API + '/stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: pageTitle, body: body, tags: [pageTitle, 'aahub'], source: location.href })
        });
        if (res.ok) success++; else fail++;
      } catch(e) { fail++; }
    }

    btn.textContent = '📥 全AAをストックに追加';
    btn.disabled = false;
    toast('✅ ' + success + '件追加完了' + (fail > 0 ? ' (' + fail + '件失敗)' : ''));
  });
})();
