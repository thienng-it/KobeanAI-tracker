/**
 * Tag Service: Handles canonical intent taxonomy, normalization, noise filtering, and color mapping.
 */

export interface TagDefinition {
  name: string;
  color: string;
  keywords: string[];
}

export const CANONICAL_TAGS: Record<string, TagDefinition> = {
  Fix: {
    name: 'Fix',
    color: '#ef4444',
    keywords: ['fix', 'bug', 'issue', 'error', 'fail', 'broken', 'crash', 'wrong', 'duplicate', 'duplicated', 'inverted', 'overflow', 'truncat', 'missing', 'regression']
  },
  Implement: {
    name: 'Implement',
    color: '#10b981',
    keywords: ['implement', 'feature', 'feat', 'add', 'create', 'build', 'support', 'new', 'develop', 'integrate']
  },
  'UI/UX': {
    name: 'UI/UX',
    color: '#3b82f6',
    keywords: ['ui', 'ux', 'theme', 'dark', 'light', 'style', 'color', 'css', 'layout', 'motion', 'button', 'contrast', 'sidebar', 'panel', 'modal', 'drawer', 'icon', 'rail', 'toolbar', 'picker', 'dropdown', 'animation']
  },
  Refactor: {
    name: 'Refactor',
    color: '#8b5cf6',
    keywords: ['refactor', 'clean', 'cleanup', 'dedup', 'reorganize', 'structure', 'modularize', 'optimize', 'simplify']
  },
  Docs: {
    name: 'Docs',
    color: '#06b6d4',
    keywords: ['doc', 'docs', 'documentation', 'guide', 'readme', 'help', 'explain', 'how to', 'manual', 'walkthrough']
  },
  Validate: {
    name: 'Validate',
    color: '#f59e0b',
    keywords: ['test', 'tests', 'validate', 'verify', 'check', 'audit', 'benchmark', 'correct', 'static', 'build', 'typecheck', 'tsc']
  },
  Config: {
    name: 'Config',
    color: '#ec4899',
    keywords: ['config', 'rule', 'rules', 'skill', 'skills', 'agent', 'model', 'token', 'price', 'env', 'key', 'codegraph', 'schema', 'sqlite']
  },
  Unknown: {
    name: 'Unknown',
    color: '#64748b',
    keywords: []
  }
};

// Patterns that identify compiler logs, warnings, or noise that should NOT become tags
const NOISE_TAG_PATTERNS = [
  /^dep\d+/i,               // e.g. DEP0169
  /^e\d{3,}/i,              // e.g. E0433
  /^warn\(/i,               // e.g. warn(unused_imports)
  /^plugin:/i,              // e.g. plugin:vite:...
  /^master\s/i,             // e.g. master f589f85
  /^as\s_/i,                // e.g. as _actionHandler
  /^\d+$/,                  // e.g. 0, 1, 2
  /^[a-z0-9_]{1,2}$/i,      // 1 or 2 character noise
  /error/i,                 // raw [ERROR]
  /info/i,                  // raw [INFO]
  /debug/i,                 // raw [DEBUG]
  /model:/i                 // model directive handled separately
];

export class TagService {
  /**
   * Extract and normalize canonical intent tags from a raw user prompt or chat turn.
   */
  static extractCanonicalTags(rawPrompt: string): string[] {
    const rawMatches = rawPrompt.match(/\[([^\]]+)\]/g) || [];
    const validExplicitTags: string[] = [];

    for (const match of rawMatches) {
      const inner = match.replace(/[\[\]]/g, '').trim();
      if (!inner) continue;

      // Check if it's compiler / system noise
      const isNoise = NOISE_TAG_PATTERNS.some(p => p.test(inner));
      if (isNoise) continue;

      // Check if it matches canonical intent (case-insensitive)
      const matchedCanonical = Object.keys(CANONICAL_TAGS).find(
        key => key.toLowerCase() === inner.toLowerCase() ||
               (inner.toLowerCase() === 'ui' && key === 'UI/UX') ||
               (inner.toLowerCase() === 'ux' && key === 'UI/UX') ||
               (inner.toLowerCase() === 'doc' && key === 'Docs') ||
               (inner.toLowerCase() === 'feat' && key === 'Implement') ||
               (inner.toLowerCase() === 'bug' && key === 'Fix')
      );

      if (matchedCanonical) {
        if (!validExplicitTags.includes(matchedCanonical)) {
          validExplicitTags.push(matchedCanonical);
        }
      } else if (/^(us-\d+|user-story|epic|task-\d+)/i.test(inner)) {
        // Allow user-story / task trackers
        const formatted = inner.toUpperCase();
        if (!validExplicitTags.includes(formatted)) {
          validExplicitTags.push(formatted);
        }
      }
    }

    // If valid explicit tags were declared, return them
    if (validExplicitTags.length > 0) {
      return validExplicitTags;
    }

    // Fallback: Automatic Intent Classification via natural language keywords
    const lower = rawPrompt.toLowerCase();
    const inferred: string[] = [];

    const isFix = CANONICAL_TAGS.Fix.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
    const isUI = CANONICAL_TAGS['UI/UX'].keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
    const isRefactor = CANONICAL_TAGS.Refactor.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
    const isValidate = CANONICAL_TAGS.Validate.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
    const isDocs = CANONICAL_TAGS.Docs.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
    const isConfig = CANONICAL_TAGS.Config.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
    const isImplement = CANONICAL_TAGS.Implement.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower));

    if (isFix) inferred.push('Fix');
    if (isUI) inferred.push('UI/UX');
    if (isRefactor && !inferred.includes('Refactor')) inferred.push('Refactor');
    if (isValidate && !inferred.includes('Validate')) inferred.push('Validate');
    if (isDocs && !inferred.includes('Docs')) inferred.push('Docs');
    if (isConfig && !inferred.includes('Config')) inferred.push('Config');
    if (isImplement && !isFix && !inferred.includes('Implement')) inferred.push('Implement');
    else if (isImplement && !inferred.includes('Implement') && inferred.length < 2) inferred.push('Implement');

    // If multiple inferred, prioritize top 2 most specific intents
    if (inferred.length > 0) {
      return inferred.slice(0, 2);
    }

    return ['Unknown'];
  }

  /**
   * Get brand accent color for a tag name
   */
  static getTagColor(tagName: string): string {
    const canonical = CANONICAL_TAGS[tagName];
    if (canonical) return canonical.color;
    if (tagName.startsWith('US-') || tagName.startsWith('TASK-')) return '#6366f1';
    return '#64748b';
  }
}
