// Tab navigation
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Modal
const modal = document.getElementById('modal');
document.getElementById('modal-cancel').addEventListener('click', () => modal.classList.add('hidden'));

// ---- Pending ----
async function renderPending() {
  const { history = [] } = await chrome.storage.local.get(['history']);
  const pending = history.filter(h => h.status === 'pending');
  const list = document.getElementById('pending-list');

  if (pending.length === 0) {
    list.innerHTML = '<p class="empty">No chats waiting for review</p>';
    return;
  }

  list.innerHTML = pending.map((item, i) => {
    const proj = item.project;
    const badge = item.score >= 85 ? 'badge-green' : 'badge-gold';
    return `
      <div class="card" data-id="${item.id}">
        <div class="card-top">
          <span class="card-title">${escHtml(item.title)}</span>
          <span class="badge ${badge}">${Math.round(item.score)}%</span>
        </div>
        ${proj ? `<div class="suggestion">Suggested: <strong>${proj.emoji} ${proj.name}</strong></div>` : ''}
        <div class="card-actions">
          ${proj ? `<button class="btn-confirm" data-id="${item.id}" data-project="${proj.id}">Confirm</button>` : ''}
          <button class="btn-pick" data-id="${item.id}">Pick project</button>
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.btn-confirm').forEach(btn => {
    btn.addEventListener('click', () => confirmRoute(btn.dataset.id, btn.dataset.project));
  });
  list.querySelectorAll('.btn-pick').forEach(btn => {
    btn.addEventListener('click', () => openPicker(btn.dataset.id));
  });
}

async function confirmRoute(id, projectId) {
  const { history = [] } = await chrome.storage.local.get(['history']);
  const entry = history.find(h => h.id === id);
  if (entry) {
    entry.status = 'confirmed';
    entry.project = PROJECTS[projectId];
    await chrome.storage.local.set({ history });
    renderPending();
    renderStats();
    updateBadge(history.filter(h => h.status === 'pending').length);
  }
}

function openPicker(id) {
  const opts = document.getElementById('modal-options');
  opts.innerHTML = Object.values(PROJECTS).map(p =>
    `<button class="project-btn" data-id="${id}" data-project="${p.id}">${p.emoji} ${p.name}</button>`
  ).join('');
  opts.querySelectorAll('.project-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmRoute(btn.dataset.id, btn.dataset.project);
      modal.classList.add('hidden');
    });
  });
  modal.classList.remove('hidden');
}

function updateBadge(count) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: String(count) });
    chrome.action.setBadgeBackgroundColor({ color: '#D4A5A5' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// ---- Stats ----
async function renderStats() {
  const { history = [] } = await chrome.storage.local.get(['history']);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = history.filter(h => h.timestamp > weekAgo);

  document.getElementById('s-total').textContent = history.length;
  document.getElementById('s-auto').textContent = history.filter(h => h.status === 'auto').length;
  document.getElementById('s-manual').textContent = history.filter(h => h.status === 'confirmed').length;
  document.getElementById('s-week').textContent = thisWeek.length;

  // Per-project bars
  const counts = {};
  Object.keys(PROJECTS).forEach(k => (counts[k] = 0));
  thisWeek.forEach(h => {
    if (h.project?.id) counts[h.project.id] = (counts[h.project.id] || 0) + 1;
  });
  const max = Math.max(...Object.values(counts), 1);
  const bars = document.getElementById('project-bars');
  bars.innerHTML = Object.entries(counts).map(([key, count]) => {
    const p = PROJECTS[key];
    const pct = Math.round((count / max) * 100);
    return `
      <div class="bar-row">
        <span class="bar-lbl">${p.emoji} ${p.name}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <span class="bar-count">${count}</span>
      </div>`;
  }).join('');
}

// ---- Settings ----
document.getElementById('clear-btn').addEventListener('click', async () => {
  if (!confirm('Delete all routing history?')) return;
  await chrome.storage.local.set({ history: [] });
  chrome.action.setBadgeText({ text: '' });
  renderPending();
  renderStats();
});

// ---- Util ----
function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Init
renderPending();
renderStats();
