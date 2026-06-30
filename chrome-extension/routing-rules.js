const PROJECTS = {
  dev_app: {
    id: 'dev_app',
    name: 'Dev & App Building',
    emoji: '💻',
    color: '#D4A5A5',
    keywords: [
      'work hub', 'react', 'claude code', 'coco', 'vercel',
      'github', 'component', 'refactor', 'typescript', 'api',
      'database', 'postgres'
    ]
  },
  fffcu: {
    id: 'fffcu',
    name: 'FFFCU Work',
    emoji: '🏢',
    color: '#8FAF8A',
    keywords: [
      'fffcu', 'zoho', 'sharepoint', 'vos', 'verafin',
      'josh rice', 'rob anderson', 'compliance', 'charter',
      'project intake', 'ncontracts'
    ]
  },
  personal: {
    id: 'personal',
    name: 'Personal & Wellbeing',
    emoji: '💡',
    color: '#C4B5C8',
    keywords: [
      'cats', 'danielle', 'lashes', 'gel nails', 'condo',
      'savings', 'student loans', 'fsa', 'health', 'home', 'diy'
    ]
  },
  gaming: {
    id: 'gaming',
    name: 'Sims & Gaming',
    emoji: '🎮',
    color: '#D4AF37',
    keywords: [
      'sims 4', 'mod', 'dbpf', 'mod studio', 'gaming', 'mods', 'modding'
    ]
  },
  learning: {
    id: 'learning',
    name: 'Learning & Growth',
    emoji: '📚',
    color: '#A5C4D4',
    keywords: [
      'project+', 'comptia', 'pk0-005', 'exam', 'emerging leader',
      'pm template', 'pmbok', 'study', 'certificate'
    ]
  }
};

function scoreTitle(title, keywords) {
  const lower = title.toLowerCase();
  let hits = 0;
  const matched = [];
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) {
      hits++;
      matched.push(kw);
    }
  }
  if (hits === 0) return { score: 0, matched };
  // Score = ratio of matched keywords, capped at 100
  // Bonus: first hit alone gives at least 40% so one strong keyword counts
  const ratio = hits / keywords.length;
  const score = Math.min(100, Math.round(40 + ratio * 60 * (keywords.length / Math.max(hits, 1))));
  // Recalculate cleanly: each match contributes equally, minimum 40 for any match
  const cleanScore = Math.min(100, Math.round(40 + (hits / keywords.length) * 60));
  return { score: cleanScore, matched };
}

function analyzeTitle(title) {
  if (!title || title.trim().length < 2) {
    return { action: 'skip', project: null, score: 0 };
  }

  const results = Object.values(PROJECTS).map(project => {
    const { score, matched } = scoreTitle(title, project.keywords);
    return { project, score, matched };
  }).sort((a, b) => b.score - a.score);

  const top = results[0];
  const second = results[1];

  if (top.score === 0) {
    return { action: 'review', project: null, score: 0, suggestion: null, allResults: results };
  }

  const tied = second && second.score >= top.score - 2 && second.score > 0;

  let action;
  if (top.score >= 95 && !tied) {
    action = 'silent';
  } else if (top.score >= 85 && !tied) {
    action = 'notify';
  } else if (top.score >= 75 || tied) {
    action = 'review_suggest';
  } else {
    action = 'review';
  }

  return {
    action,
    project: top.project,
    score: top.score,
    matched: top.matched,
    suggestion: top.project,
    hasTie: tied,
    allResults: results
  };
}
