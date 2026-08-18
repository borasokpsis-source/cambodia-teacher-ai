import { OFFICIAL_MOEYS_TEXTBOOKS } from '../data/officialMoEYSTextbooks';
import { getRecommendedOpenResources } from '../data/openEducationalResources';
import { applyHappyChandaraTemplate } from '../data/teacherTemplateProfiles';
import { validateLessonPlan } from './qualityValidator';

function findOfficialBook(subjectId, gradeLevel) {
  if (subjectId === 'biology' && gradeLevel >= 10) {
    return OFFICIAL_MOEYS_TEXTBOOKS[`biology_g${gradeLevel}`] || null;
  }
  if (subjectId === 'science' && gradeLevel >= 7 && gradeLevel <= 9) {
    return OFFICIAL_MOEYS_TEXTBOOKS[`science_g${gradeLevel}`] || null;
  }
  return null;
}

export function resolveCurriculumAnchor({
  gradeLevel,
  subjectId,
  subjectNameKm,
  subjectNameEn,
  topic,
}) {
  const book = findOfficialBook(subjectId, gradeLevel);
  let matchedChapter = null;
  let matchedLesson = null;

  if (book) {
    for (const chapter of book.chapters || []) {
      const lesson = (chapter.lessons || []).find(
        (candidate) => topic.includes(candidate) || candidate.includes(topic)
      );
      if (lesson) {
        matchedChapter = chapter.chapterKm;
        matchedLesson = lesson;
        break;
      }
    }
  }

  return {
    grade: gradeLevel,
    subjectId,
    subjectKm: subjectNameKm,
    subjectEn: subjectNameEn,
    topic,
    officialBookTitle: book?.titleKm || null,
    chapter: matchedChapter,
    lesson: matchedLesson || topic,
    alignmentStatus: matchedLesson ? 'official-title-match' : 'teacher-entered-topic',
    scopeNoteKm: matchedLesson
      ? 'ប្រើចំណងជើងមេរៀនផ្លូវការជាព្រំដែនកម្មវិធីសិក្សា; ខ្លឹមសារបន្ថែមត្រូវសមស្របនឹងថ្នាក់។'
      : 'ប្រធានបទកំណត់ដោយគ្រូ; ត្រូវផ្ទៀងផ្ទាត់វិសាលភាពជាមួយកម្មវិធីសិក្សាមុនផ្សព្វផ្សាយ។',
  };
}

export function selectEnrichmentSources({ subjectId, selectedSources = [], allowOpenEnrichment = true }) {
  if (!allowOpenEnrichment) return [];
  if (selectedSources.length > 0) return selectedSources;
  return getRecommendedOpenResources(subjectId);
}

export function formatContextForPrompt(anchor, sources) {
  const sourceLines = sources.length
    ? sources
        .map(
          (source, index) =>
            `${index + 1}. ${source.title} (${source.organization || 'Unknown'}) - ${source.url}\n` +
            `   License: ${source.license}. Teaching use: ${source.descriptionKm || source.notes || 'Reference only'}`
        )
        .join('\n')
    : 'No external enrichment source selected.';

  return `
CURRICULUM ANCHOR (defines scope, grade and terminology):
- Grade: ${anchor.grade}
- Subject: ${anchor.subjectKm} (${anchor.subjectEn})
- Official book: ${anchor.officialBookTitle || 'Not yet indexed'}
- Chapter: ${anchor.chapter || 'Teacher-selected scope'}
- Target lesson: ${anchor.lesson}
- Teaching-session target: ${anchor.sessionTitle || anchor.lesson}
- Selected subtitles: ${anchor.selectedSubtitles?.length ? anchor.selectedSubtitles.join('; ') : 'Whole lesson'}
- Teacher-entered focus: ${anchor.customSessionFocus || 'None'}
- Alignment status: ${anchor.alignmentStatus}

OPEN ENRICHMENT REFERENCES:
${sourceLines}

SOURCE RULES:
- The curriculum anchor controls WHAT is appropriate for this grade.
- When a teaching-session target is supplied, it is a strict subset of the parent lesson. Do not teach or assess unselected subtitles.
- Open references may enrich HOW the lesson is explained or taught.
- Do not claim that MoEYS approved the generated lesson plan.
- Do not copy long passages. Create an original classroom-ready lesson and preserve source traceability.
- Do not claim to have opened a URL. Use only the descriptions supplied above and reliable general knowledge.
`;
}

export function finalizeLessonPlan(
  plan,
  { anchor, sources, sourceUsage = 'recommended-enrichment' }
) {
  const durationMins =
    Number(plan?.metadata?.durationMins) || Number.parseInt(plan?.metadata?.duration, 10) || 0;
  const finalized = {
    ...plan,
    metadata: {
      ...plan.metadata,
      durationMins,
      curriculumAlignment: anchor.alignmentStatus,
      sourceUsage,
    },
    curriculumAnchor: anchor,
    enrichmentSources: sources.map((source) => ({
      id: source.id,
      title: source.title,
      organization: source.organization,
      url: source.url,
      license: source.license,
      licenseCode: source.licenseCode,
      descriptionKm: source.descriptionKm || source.notes || '',
      usageNoteKm: source.usageNoteKm || '',
      trustLevel: source.trustLevel || 'teacher-added',
      usage: sourceUsage,
    })),
    publication: plan.publication || {
      status: 'draft',
      license: 'CC BY 4.0',
      reviewStatus: 'unreviewed',
      version: 1,
    },
  };

  const templated = applyHappyChandaraTemplate(finalized);

  return {
    ...templated,
    qualityReport: validateLessonPlan(templated),
  };
}
