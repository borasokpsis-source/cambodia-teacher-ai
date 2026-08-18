const STORAGE_KEY = 'kruai_lesson_subtitles_v1';

function normalizeSubtitles(subtitles = []) {
  return [...new Set(
    (Array.isArray(subtitles) ? subtitles : [])
      .map((subtitle) => String(subtitle).trim())
      .filter(Boolean)
  )];
}

function loadSubtitleMap() {
  try {
    const rawValue = globalThis.localStorage?.getItem(STORAGE_KEY);
    const parsed = rawValue ? JSON.parse(rawValue) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function loadLessonSubtitleOptions(topic) {
  const normalizedTopic = String(topic || '').trim();
  if (!normalizedTopic) return [];
  return normalizeSubtitles(loadSubtitleMap()[normalizedTopic]);
}

export function saveLessonSubtitleOptions(topic, subtitles) {
  const normalizedTopic = String(topic || '').trim();
  if (!normalizedTopic || !globalThis.localStorage) return [];

  const normalizedSubtitles = normalizeSubtitles(subtitles);
  const subtitleMap = loadSubtitleMap();
  if (normalizedSubtitles.length > 0) {
    subtitleMap[normalizedTopic] = normalizedSubtitles;
  } else {
    delete subtitleMap[normalizedTopic];
  }

  try {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(subtitleMap));
  } catch {
    // Keep the form usable when browser storage is unavailable or full.
  }
  return normalizedSubtitles;
}
