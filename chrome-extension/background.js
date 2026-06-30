const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['history'], result => {
    if (!result.history) {
      chrome.storage.local.set({ history: [] });
    }
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'ANALYZE_TITLE') {
    handleTitle(msg.title, sender.tab);
  }
  return false;
});

async function handleTitle(title, tab) {
  // Deduplicate: skip if we already have a recent entry for this exact title
  const { history = [] } = await chrome.storage.local.get(['history']);
  const tenMinAgo = Date.now() - 10 * 60 * 1000;
  const recent = history.find(h => h.title === title && h.timestamp > tenMinAgo);
  if (recent) return;

  // analyzeTitle is defined in routing-rules.js — inject it into the service worker context
  // by importing the file via importScripts
  const result = analyzeTitle(title);
  if (result.action === 'skip') return;

  const entry = {
    id: Date.now().toString(),
    title,
    project: result.project || null,
    score: result.score,
    action: result.action,
    status: (result.action === 'silent' || result.action === 'notify') ? 'auto' : 'pending',
    timestamp: Date.now()
  };

  // Purge old entries and save
  const fresh = history.filter(h => Date.now() - h.timestamp < THIRTY_DAYS);
  fresh.push(entry);
  await chrome.storage.local.set({ history: fresh });

  // Badge management
  const pendingCount = fresh.filter(h => h.status === 'pending').length;
  updateBadge(pendingCount);

  // Notify badge for auto-routed with confirmation
  if (result.action === 'notify' && tab?.id) {
    chrome.action.setBadgeText({ text: '✓', tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#8FAF8A', tabId: tab.id });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: pendingCount > 0 ? String(pendingCount) : '' });
      chrome.action.setBadgeBackgroundColor({ color: '#D4A5A5' });
    }, 3000);
  }
}

function updateBadge(count) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: String(count) });
    chrome.action.setBadgeBackgroundColor({ color: '#D4A5A5' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Make analyzeTitle available in service worker scope
importScripts('routing-rules.js');
