const LESSON_LIBRARY_KEY = 'kruai_lesson_library_v1';
const RESOURCE_LIBRARY_KEY = 'kruai_resource_library_v1';

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function createId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function loadLessonLibrary() {
  return safeParse(localStorage.getItem(LESSON_LIBRARY_KEY), []);
}

export function saveLessonToLibrary(plan, status = 'draft') {
  const now = new Date().toISOString();
  const existing = loadLessonLibrary();
  const existingIndex = existing.findIndex((item) => item.metadata?.id === plan.metadata?.id);
  const previous = existingIndex >= 0 ? existing[existingIndex] : null;
  const savedPlan = {
    ...plan,
    metadata: {
      ...plan.metadata,
      id: plan.metadata?.id || createId('LP'),
      savedAt: now,
    },
    publication: {
      status,
      license: plan.publication?.license || 'CC BY 4.0',
      reviewStatus: plan.publication?.reviewStatus || 'unreviewed',
      version: previous ? Number(previous.publication?.version || 1) + 1 : 1,
      author: plan.metadata?.teacherName || 'Unknown teacher',
      publishedAt: status === 'published' ? previous?.publication?.publishedAt || now : null,
      updatedAt: now,
      parentPlanId: plan.publication?.parentPlanId || null,
    },
  };

  if (existingIndex >= 0) existing[existingIndex] = savedPlan;
  else existing.unshift(savedPlan);

  localStorage.setItem(LESSON_LIBRARY_KEY, JSON.stringify(existing));
  return savedPlan;
}

export function remixLessonPlan(plan, teacherName) {
  const now = new Date().toISOString();
  return {
    ...structuredClone(plan),
    metadata: {
      ...plan.metadata,
      id: createId('LP-REMIX'),
      teacherName: teacherName || plan.metadata?.teacherName,
      generatedAt: now,
      savedAt: null,
    },
    publication: {
      status: 'draft',
      license: plan.publication?.license || 'CC BY 4.0',
      reviewStatus: 'unreviewed',
      version: 1,
      author: teacherName || plan.metadata?.teacherName || 'Unknown teacher',
      publishedAt: null,
      updatedAt: now,
      parentPlanId: plan.metadata?.id || null,
    },
  };
}

export function loadTeacherResources() {
  return safeParse(localStorage.getItem(RESOURCE_LIBRARY_KEY), []);
}

export function saveTeacherResource(resource) {
  const existing = loadTeacherResources();
  const savedResource = {
    ...resource,
    id: resource.id || createId('RESOURCE'),
    subjects: resource.subjects?.length ? resource.subjects : ['all'],
    organization: resource.organization || 'Teacher contributed',
    trustLevel: 'teacher-added',
    addedAt: resource.addedAt || new Date().toISOString(),
  };
  existing.unshift(savedResource);
  localStorage.setItem(RESOURCE_LIBRARY_KEY, JSON.stringify(existing));
  return savedResource;
}
