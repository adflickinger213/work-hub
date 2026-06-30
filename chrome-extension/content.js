let _lastTitle = '';
let _checkInterval = null;

function getTitle() {
  // Try multiple selectors across Claude UI versions
  const candidates = [
    document.querySelector('[data-testid="conversation-title"]'),
    document.querySelector('.conversation-title'),
    document.querySelector('h1'),
    document.querySelector('[class*="title"]'),
    document.querySelector('[class*="ConversationTitle"]'),
  ];
  for (const el of candidates) {
    const t = el?.textContent?.trim();
    if (t && t.length > 1 && t !== 'Claude') return t;
  }
  // Fall back to page title
  const pt = document.title.replace(/\s*[-|]\s*Claude.*$/i, '').trim();
  return pt.length > 1 ? pt : '';
}

function sendToBackground(title) {
  chrome.runtime.sendMessage({ type: 'ANALYZE_TITLE', title });
}

function checkTitle() {
  const title = getTitle();
  if (title && title !== _lastTitle) {
    _lastTitle = title;
    sendToBackground(title);
  }
}

// Check immediately and then watch for title changes
checkTitle();
_checkInterval = setInterval(checkTitle, 2000);

// Also watch DOM for title mutations
const observer = new MutationObserver(() => checkTitle());
observer.observe(document.body, { childList: true, subtree: true, characterData: true });
