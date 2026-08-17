function countWorksheetQuestions(fullWorksheet) {
  return (fullWorksheet?.sections || []).reduce(
    (total, section) => total + (section.questions?.length || 0),
    0
  );
}

function makeCheck(id, labelKm, status, detailKm, weight) {
  return { id, labelKm, status, detailKm, weight };
}

export function validateLessonPlan(plan) {
  const duration = Number(plan?.metadata?.durationMins || 0);
  const allocatedTime = (plan?.fiveStepsProcess || []).reduce(
    (total, step) => total + Number(step.timeMins || 0),
    0
  );
  const objectives = plan?.objectives || {};
  const objectiveReady = ['knowledge', 'skills', 'attitude'].every(
    (key) => typeof objectives[key] === 'string' && objectives[key].trim().length >= 24
  );
  const worksheetQuestions = countWorksheetQuestions(plan?.fullWorksheet);
  const hasAnchor = Boolean(plan?.curriculumAnchor?.topic);
  const sources = plan?.enrichmentSources || [];
  const traceableSources = sources.filter((source) => source.url && source.license).length;
  const topic = plan?.metadata?.topic || '';
  const blackboard = plan?.blackboardSummary || '';
  const genericMarkers = [
    'ការសិក្សា និង ការយល់ដឹងពីទ្រឹស្តីសំខាន់ៗ',
    'ការភ្ជាប់ទ្រឹស្តីទៅនឹងការដោះស្រាយបញ្ហា',
    'មានន័យតែក្នុងសៀវភៅពុម្ព',
  ];
  const isGenericDraft =
    plan?.metadata?.contentProfile === 'generic-draft' ||
    genericMarkers.some((marker) => blackboard.includes(marker));
  const topicSpecific = Boolean(
    topic &&
    !isGenericDraft &&
    blackboard.length >= 140 &&
    blackboard.includes(topic.split(' - ').pop())
  );
  const materialsReady = (plan?.teachingAids?.length || 0) >= 2;
  const activity = plan?.handsOnActivity || {};
  const activityReady =
    !isGenericDraft &&
    (activity.steps?.length || 0) >= 3 &&
    (activity.thinkingPrompts?.length || 0) >= 1;

  const checks = [
    makeCheck(
      'curriculum',
      'ព្រំដែនកម្មវិធីសិក្សា',
      hasAnchor ? 'pass' : 'fail',
      hasAnchor ? 'មានកំណត់ត្រាថ្នាក់ មុខវិជ្ជា និងប្រធានបទ។' : 'មិនទាន់មាន curriculum anchor។',
      15
    ),
    makeCheck(
      'objectives',
      'វត្ថុបំណងអាចវាស់វែងបាន',
      objectiveReady ? 'pass' : 'warn',
      objectiveReady ? 'មានវត្ថុបំណងពុទ្ធិ បំណិន និងឥរិយាបថ។' : 'គួរពិនិត្យ និងធ្វើឱ្យវត្ថុបំណងជាក់លាក់ជាងនេះ។',
      15
    ),
    makeCheck(
      'timing',
      'ការបែងចែកពេលវេលា',
      duration > 0 && allocatedTime === duration ? 'pass' : 'warn',
      duration > 0
        ? `បានបែងចែក ${allocatedTime} នាទី ក្នុងចំណោម ${duration} នាទី។`
        : `បានបែងចែក ${allocatedTime} នាទី; មិនមានរយៈពេលគោលដៅជាលេខ។`,
      10
    ),
    makeCheck(
      'topic-specificity',
      'ខ្លឹមសារជាក់លាក់តាមប្រធានបទ',
      topicSpecific ? 'pass' : isGenericDraft ? 'fail' : 'warn',
      topicSpecific
        ? 'សេចក្តីសង្ខេបមាននិយមន័យ គំនិតគន្លឹះ និងឧទាហរណ៍តាមប្រធានបទ។'
        : isGenericDraft
          ? 'ម៉ាស៊ីន offline មិនទាន់មានគំរូជំនាញសម្រាប់ប្រធានបទនេះ; ត្រូវកែខ្លឹមសារមុនប្រើ។'
          : 'ត្រូវការគ្រូពិនិត្យថាខ្លឹមសារមិនទូទៅពេក។',
      20
    ),
    makeCheck(
      'assessment',
      'ការវាយតម្លៃ និងចម្លើយ',
      worksheetQuestions >= 5 ? 'pass' : worksheetQuestions >= 3 ? 'warn' : 'fail',
      `មានសំណួរ ${worksheetQuestions} ក្នុងសន្លឹកកិច្ចការ។`,
      20
    ),
    makeCheck(
      'sources',
      'ប្រភពអាចតាមដានបាន',
      traceableSources > 0 ? 'pass' : 'warn',
      traceableSources > 0
        ? `មានប្រភពបន្ថែម ${traceableSources} ដែលមានតំណ និងអាជ្ញាបណ្ណ។`
        : 'មិនទាន់មានប្រភពបន្ថែមដែលអាចតាមដានបាន។',
      10
    ),
    makeCheck(
      'materials',
      'សម្ភារបង្រៀន',
      materialsReady ? 'pass' : 'warn',
      materialsReady ? 'មានសម្ភារបង្រៀនយ៉ាងតិច ២ មុខ។' : 'គួរបន្ថែមសម្ភារបង្រៀនជាក់ស្តែង។',
      5
    ),
    makeCheck(
      'inquiry-activity',
      'សកម្មភាពស្រាវជ្រាវជាក់លាក់',
      activityReady ? 'pass' : isGenericDraft ? 'fail' : 'warn',
      activityReady
        ? 'មានយ៉ាងតិច ៣ ជំហាន និងសំណួរជំរុញការគិតតាមប្រធានបទ។'
        : isGenericDraft
          ? 'សកម្មភាពនៅទូទៅពេក និងមិនទាន់អាចវាស់លទ្ធផលជាក់លាក់។'
          : 'គួរបន្ថែមជំហានអនុវត្ត និងសំណួរជំរុញការគិត។',
      5
    ),
  ];

  const earned = checks.reduce((total, check) => {
    if (check.status === 'pass') return total + check.weight;
    if (check.status === 'warn') return total + check.weight * 0.5;
    return total;
  }, 0);
  const score = Math.round(earned);

  return {
    score,
    grade: score >= 85 ? 'strong' : score >= 65 ? 'review' : 'needs-work',
    allocatedTime,
    targetDuration: duration,
    worksheetQuestions,
    checks,
    reviewedByHuman: false,
    humanReviewRequired: score < 85 || checks.some((check) => check.status === 'fail'),
  };
}
