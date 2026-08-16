export interface DateThresholds {
  currentThreshold: Date | null;
  endThreshold: Date | null;
  previousThreshold: Date | null;
  previousEndThreshold: Date | null;
  label: string;
  isSingleDay: boolean;
  dateStr?: string;
  sqliteTzModifier: string;
}

/**
 * Parses client date range and client timezone offset to compute exact UTC query boundaries
 * and SQLite datetime modifiers corresponding to the user's local machine clock.
 * 
 * @param dateRange - '1d', 'today', '7d', '30d', '90d', '180d', '365d', 'all', or 'date:YYYY-MM-DD'
 * @param tzOffsetParam - Timezone offset in minutes (e.g., -420 for UTC+7). Positive values are west of UTC (e.g., 300 for UTC-5).
 */
export function getDateThresholds(dateRange: string, tzOffsetParam?: number | string): DateThresholds {
  // Default to server/system timezone if not passed by client
  let tzOffsetMinutes = typeof tzOffsetParam === 'number'
    ? tzOffsetParam
    : (typeof tzOffsetParam === 'string' && !isNaN(parseInt(tzOffsetParam, 10)) 
        ? parseInt(tzOffsetParam, 10) 
        : new Date().getTimezoneOffset());

  // SQLite modifier string: 
  // In JS, getTimezoneOffset() returns minutes *difference* between UTC and local time (UTC - local).
  // E.g. UTC+7 returns -420, so to convert UTC timestamp to local in SQLite we ADD 420 minutes ('+420 minutes').
  // E.g. UTC-5 returns +300, so to convert UTC timestamp to local in SQLite we SUBTRACT 300 minutes ('-300 minutes').
  const sqliteTzModifier = tzOffsetMinutes <= 0 
    ? `+${Math.abs(tzOffsetMinutes)} minutes` 
    : `-${Math.abs(tzOffsetMinutes)} minutes`;

  const nowUtc = new Date();
  
  // Local time ms
  const localNowMs = nowUtc.getTime() - tzOffsetMinutes * 60 * 1000;
  const localNow = new Date(localNowMs);

  const localYear = localNow.getUTCFullYear();
  const localMonth = localNow.getUTCMonth();
  const localDay = localNow.getUTCDate();

  // Helper to convert Local (Y, M, D, H, M, S, MS) into UTC Date
  const createUtcFromLocal = (y: number, m: number, d: number, h = 0, min = 0, s = 0, ms = 0): Date => {
    const localUtcMs = Date.UTC(y, m, d, h, min, s, ms);
    return new Date(localUtcMs + tzOffsetMinutes * 60 * 1000);
  };

  let currentThreshold: Date | null = null;
  let endThreshold: Date | null = null;
  let previousThreshold: Date | null = null;
  let previousEndThreshold: Date | null = null;
  let label = 'vs prior period';
  let isSingleDay = false;

  const cleanRange = (dateRange || '7d').trim().toLowerCase();

  // 1. Specific custom single calendar date (e.g. "date:2026-08-16" or "2026-08-16")
  const dateMatch = cleanRange.match(/(?:date:)?(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const y = parseInt(dateMatch[1], 10);
    const m = parseInt(dateMatch[2], 10) - 1;
    const d = parseInt(dateMatch[3], 10);
    const dateStr = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;

    currentThreshold = createUtcFromLocal(y, m, d, 0, 0, 0, 0);
    endThreshold = createUtcFromLocal(y, m, d, 23, 59, 59, 999);

    // Prior single day
    previousThreshold = createUtcFromLocal(y, m, d - 1, 0, 0, 0, 0);
    previousEndThreshold = createUtcFromLocal(y, m, d - 1, 23, 59, 59, 999);

    label = `vs prior day`;
    isSingleDay = true;
    return { currentThreshold, endThreshold, previousThreshold, previousEndThreshold, label, isSingleDay, dateStr, sqliteTzModifier };
  }

  // 2. Presets
  switch (cleanRange) {
    case '1d':
    case 'today':
      // Local Calendar Today: 00:00:00.000 to 23:59:59.999 in user's local timezone
      currentThreshold = createUtcFromLocal(localYear, localMonth, localDay, 0, 0, 0, 0);
      endThreshold = createUtcFromLocal(localYear, localMonth, localDay, 23, 59, 59, 999);

      // Local Calendar Yesterday
      previousThreshold = createUtcFromLocal(localYear, localMonth, localDay - 1, 0, 0, 0, 0);
      previousEndThreshold = createUtcFromLocal(localYear, localMonth, localDay - 1, 23, 59, 59, 999);

      label = 'vs yesterday';
      isSingleDay = true;
      break;

    case '24h':
      // Rolling 24 Hours
      currentThreshold = new Date(nowUtc.getTime() - 24 * 60 * 60 * 1000);
      previousThreshold = new Date(nowUtc.getTime() - 48 * 60 * 60 * 1000);
      label = 'vs prior 24h';
      isSingleDay = true;
      break;

    case '7d':
      // Past 7 Days (including today)
      currentThreshold = createUtcFromLocal(localYear, localMonth, localDay - 6, 0, 0, 0, 0);
      previousThreshold = createUtcFromLocal(localYear, localMonth, localDay - 13, 0, 0, 0, 0);
      label = 'vs last week';
      break;

    case '30d':
      // Past 30 Days
      currentThreshold = createUtcFromLocal(localYear, localMonth, localDay - 29, 0, 0, 0, 0);
      previousThreshold = createUtcFromLocal(localYear, localMonth, localDay - 59, 0, 0, 0, 0);
      label = 'vs last month';
      break;

    case '90d':
      currentThreshold = createUtcFromLocal(localYear, localMonth, localDay - 89, 0, 0, 0, 0);
      previousThreshold = createUtcFromLocal(localYear, localMonth, localDay - 179, 0, 0, 0, 0);
      label = 'vs last quarter';
      break;

    case '180d':
      currentThreshold = createUtcFromLocal(localYear, localMonth, localDay - 179, 0, 0, 0, 0);
      previousThreshold = createUtcFromLocal(localYear, localMonth, localDay - 359, 0, 0, 0, 0);
      label = 'vs last 6 months';
      break;

    case '365d':
      currentThreshold = createUtcFromLocal(localYear, localMonth, localDay - 364, 0, 0, 0, 0);
      previousThreshold = createUtcFromLocal(localYear, localMonth, localDay - 729, 0, 0, 0, 0);
      label = 'vs last year';
      break;

    case 'all':
    default:
      currentThreshold = null;
      endThreshold = null;
      previousThreshold = null;
      previousEndThreshold = null;
      label = 'overall';
      break;
  }

  return { currentThreshold, endThreshold, previousThreshold, previousEndThreshold, label, isSingleDay, sqliteTzModifier };
}
