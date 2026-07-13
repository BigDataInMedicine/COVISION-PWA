export const version = "1.1.14 16.04.2026";

type VersionEvent = {
  version: string;
  recordedAt: string; // ISO timestamp
  reason: "first" | "changed";
};

const KEY = "appVersionHistory";

export function recordVersionHistory(currentVersion: string) {
  const now = new Date().toISOString();

  let history: VersionEvent[] = [];
  try {
    history = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }

  const last = history[history.length - 1];

  // first ever record
  if (!last) {
    history.push({ version: currentVersion, recordedAt: now, reason: "first" });
    localStorage.setItem(KEY, JSON.stringify(history));
    return;
  }

  // append only if version changed (prevents duplicates on every reload)
  if (last.version !== currentVersion) {
    history.push({
      version: currentVersion,
      recordedAt: now,
      reason: "changed",
    });
    localStorage.setItem(KEY, JSON.stringify(history));
  }
}

export function getVersionHistory(): VersionEvent[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
