export const HAPPY_CHANDARA_TEMPLATE = {
  id: 'happy-chandara-v1',
  nameKm: 'ទម្រង់កិច្ចតែងការសាលាហេបភីច័ន្ទតារានារីព្រែកថ្មី',
  nameEn: 'Happy Chandara teacher lesson format',
  author: 'សុខ បូរ៉ា',
  school: 'សាលាហេបភីច័ន្ទតារានារីព្រែកថ្មី',
  worksheetRequired: true,
  slidesOptional: true,
  sourceSummaryKm:
    'ស្រង់រចនាសម្ព័ន្ធពីកិច្ចតែងការ សន្លឹកកិច្ចការ និងស្លាយគំរូដែលគ្រូបានផ្តល់។ មិនចម្លងខ្លឹមសារមេរៀនដើមទេ។',
};

function cleanPrompt(value = '') {
  return value.replace(/^[❓•\s"“”]+|["“”]+$/g, '').trim();
}

function compactLines(value = '', limit = 3) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function buildWorksheet(plan) {
  const activity = plan.handsOnActivity || {};
  const diagnostic = cleanPrompt(plan.misconceptionsAlert?.diagnosticQuestion || '');
  const thinkingPrompt = cleanPrompt(activity.thinkingPrompts?.[0] || '');

  return {
    required: true,
    format: 'separate-student-handout',
    objective: plan.objectives?.skills || plan.objectives?.knowledge || '',
    backgroundKnowledge: compactLines(plan.blackboardSummary, 2).join(' '),
    inquiryQuestion:
      diagnostic || thinkingPrompt || `តើសិស្សអាចបកស្រាយ និងអនុវត្ត ${plan.metadata?.topic} បានយ៉ាងដូចម្តេច?`,
    hypothesisPrompt: 'ចូរសរសេរចម្លើយបឋម ឬសម្មតិកម្មរបស់ក្រុម មុនចាប់ផ្តើមសកម្មភាព។',
    materials: activity.materialsNeeded?.length
      ? activity.materialsNeeded
      : plan.teachingAids || [],
    procedure: activity.steps || [],
    resultsPrompt: 'កត់ត្រាលទ្ធផល ភស្តុតាង ការគណនា ឬរូបភាពដែលបានសង្កេតក្នុងកន្លែងខាងក្រោម។',
    conclusionPrompt:
      thinkingPrompt || `សន្និដ្ឋានថាលទ្ធផលគាំទ្រចម្លើយបឋមអំពី ${plan.metadata?.topic} ឬទេ ហើយពន្យល់មូលហេតុ។`,
  };
}

function buildSlideOutline(plan) {
  const firstQuestions = (plan.fullWorksheet?.sections || [])
    .flatMap((section) => section.questions || [])
    .slice(0, 2)
    .map((question) => question.question);
  const conceptLines = compactLines(plan.blackboardSummary, 4);
  const activity = plan.handsOnActivity || {};

  return [
    {
      slideNumber: 1,
      role: 'title',
      title: plan.metadata?.topic,
      content: [
        plan.curriculumAnchor?.chapter,
        `${plan.metadata?.subjectKm} · ${plan.metadata?.grade}`,
      ].filter(Boolean),
      visualBriefKm: 'ទំព័រចំណងជើងសាមញ្ញ មានរូបតំណាងប្រធានបទមួយ។',
    },
    {
      slideNumber: 2,
      role: 'engage',
      title: 'សំណួរចាប់អារម្មណ៍ និងរំលឹកចំណេះដឹងចាស់',
      content: [cleanPrompt(plan.misconceptionsAlert?.diagnosticQuestion || ''), firstQuestions[0]].filter(Boolean),
      visualBriefKm: 'ប្រើរូបភាព ឬបាតុភូតមួយសម្រាប់ឱ្យសិស្សសង្កេត មុនបង្ហាញចម្លើយ។',
    },
    {
      slideNumber: 3,
      role: 'concept-visual',
      title: 'ខ្លឹមសារសំខាន់',
      content: conceptLines,
      visualBriefKm: 'ប្រើដ្យាក្រាម រូបភាពមានស្លាក ឬតារាងយោង; ជៀសវាងអត្ថបទច្រើន។',
    },
    {
      slideNumber: 4,
      role: 'activity-guide',
      title: activity.title || `សកម្មភាព៖ ${plan.metadata?.topic}`,
      content: (activity.steps || []).slice(0, 4),
      visualBriefKm: 'បង្ហាញសម្ភារ និងជំហានសុវត្ថិភាពដោយរូបភាព ឬលេខរៀង។',
    },
    {
      slideNumber: 5,
      role: 'worksheet-discussion',
      title: 'សន្លឹកកិច្ចការ និងការពិភាក្សាលទ្ធផល',
      content: firstQuestions,
      visualBriefKm: 'បង្ហាញតែសំណួរគន្លឹះ ឬរូបតារាងយោង; សិស្សកត់ចម្លើយក្នុងសន្លឹកកិច្ចការ។',
    },
  ];
}

function addTraditionalContent(process = [], plan) {
  const labels = [
    'ជំហានទី១៖ ពង្រឹងវិន័យ និងត្រៀមថ្នាក់',
    'ជំហានទី២៖ រំលឹកមេរៀនចាស់',
    `ជំហានទី៣៖ មេរៀនថ្មី — ${plan.metadata?.topic}`,
    'ជំហានទី៤៖ អនុវត្ត និងបង្ហាញលទ្ធផល',
    'ជំហានទី៥៖ វាយតម្លៃ និងបណ្ដាំផ្ញើ',
  ];
  const content = [
    'ត្រួតពិនិត្យអវត្តមាន អនាម័យ សណ្ដាប់ធ្នាប់ និងសម្ភាររៀន។',
    'ភ្ជាប់ចំណេះដឹងមុនទៅនឹងសំណួរចាប់ផ្តើមមេរៀន។',
    plan.blackboardSummary || plan.metadata?.topic,
    'សិស្សអនុវត្ត បកស្រាយភស្តុតាង និងប្រៀបធៀបលទ្ធផលជាក្រុម។',
    'សង្ខេបខ្លឹមសារ ពិនិត្យការយល់ដឹង និងកំណត់កិច្ចការបន្ត។',
  ];

  return process.map((step, index) => ({
    ...step,
    traditionalStepNameKm: labels[index] || step.stepNameKm,
    lessonContent: content[index] || step.evaluation,
  }));
}

export function applyHappyChandaraTemplate(plan) {
  const includeSlides = plan.metadata?.includeSlides !== false;
  const processTableMode =
    plan.metadata?.teachingMethodId === 'moeys_standard'
      ? 'teacher-content-student'
      : 'five-e-activity-time';

  const templated = {
    ...plan,
    metadata: {
      ...plan.metadata,
      templateProfile: HAPPY_CHANDARA_TEMPLATE.id,
      templateProfileNameKm: HAPPY_CHANDARA_TEMPLATE.nameKm,
      includeSlides,
    },
    fiveStepsProcess: addTraditionalContent(plan.fiveStepsProcess || [], plan),
    teacherTemplate: {
      ...HAPPY_CHANDARA_TEMPLATE,
      processTableMode,
      generalInformation: {
        chapter: plan.curriculumAnchor?.chapter || 'ប្រធានបទកំណត់ដោយគ្រូ',
        lesson: plan.curriculumAnchor?.lesson || plan.metadata?.topic,
        topic: plan.metadata?.topic,
        grade: plan.metadata?.grade,
      },
      worksheet: buildWorksheet(plan),
      slideDeck: {
        enabled: includeSlides,
        slides: includeSlides ? buildSlideOutline(plan) : [],
      },
    },
  };

  return templated;
}
