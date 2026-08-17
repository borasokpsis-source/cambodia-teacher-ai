// Export Utilities: Telegram Share, MS Word (.doc), and Printing for Cambodian Teachers

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function withBreaks(value = '') {
  return escapeHtml(value).replaceAll('\n', '<br/>');
}

function downloadWordHtml(htmlContent, filename) {
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function buildHappyChandaraWordHtml(lessonPlan) {
  const {
    metadata,
    objectives,
    teachingAids = [],
    fiveStepsProcess = [],
    blackboardSummary,
    fullWorksheet,
    teacherTemplate,
    curriculumAnchor,
    enrichmentSources = [],
    publication,
  } = lessonPlan;
  const isFiveE = teacherTemplate?.processTableMode === 'five-e-activity-time';
  const materials = [...new Set([
    ...teachingAids,
    'សន្លឹកកិច្ចការសិស្ស',
    ...(teacherTemplate?.slideDeck?.enabled ? ['Projector និងស្លាយជំនួយបង្រៀន'] : []),
  ])];
  const worksheet = teacherTemplate?.worksheet || {};

  const processRows = fiveStepsProcess.map((step) => {
    if (isFiveE) {
      return `<tr>
        <td>${escapeHtml(step.stepNameKm)}</td>
        <td><strong>សកម្មភាពគ្រូ៖</strong><br/>${withBreaks(step.teacherActivity)}<br/><br/><strong>សកម្មភាពសិស្ស៖</strong><br/>${withBreaks(step.studentActivity)}<br/><br/><strong>ការវាយតម្លៃ៖</strong> ${escapeHtml(step.evaluation)}</td>
        <td class="center">${escapeHtml(step.timeMins)}</td>
      </tr>`;
    }
    return `<tr>
      <td>${withBreaks(step.teacherActivity)}</td>
      <td><strong>${escapeHtml(step.traditionalStepNameKm)}</strong><br/>${withBreaks(step.lessonContent)}<br/><small>${escapeHtml(step.timeMins)} នាទី</small></td>
      <td>${withBreaks(step.studentActivity)}</td>
    </tr>`;
  }).join('');

  const worksheetQuestions = (fullWorksheet?.sections || []).map((section) => `
    <h4>${escapeHtml(section.sectionTitle)}</h4>
    ${(section.questions || []).map((question) => `
      <div class="question">
        <p><strong>សំណួរទី ${escapeHtml(question.id)}៖</strong> ${escapeHtml(question.question)}</p>
        ${question.options ? `<p class="indent">${question.options.map(escapeHtml).join('<br/>')}</p>` : ''}
        <div class="answer"><strong>កូនសោចម្លើយគ្រូ៖</strong> ${escapeHtml(question.correctAnswer)}${question.explanation ? `<br/><small>${escapeHtml(question.explanation)}</small>` : ''}</div>
      </div>`).join('')}
  `).join('');

  const slidesHtml = teacherTemplate?.slideDeck?.enabled
    ? `<div class="page-break"></div><h2>គម្រោងស្លាយជំនួយបង្រៀន (ជាជម្រើស)</h2>${teacherTemplate.slideDeck.slides.map((slide) => `
      <div class="box"><strong>Slide ${slide.slideNumber}: ${escapeHtml(slide.title)}</strong><ul>${slide.content.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><small>${escapeHtml(slide.visualBriefKm)}</small></div>
    `).join('')}`
    : '';

  const sourcesHtml = enrichmentSources.length
    ? `<ul>${enrichmentSources.map((source) => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a> — ${escapeHtml(source.organization)} (${escapeHtml(source.license)})</li>`).join('')}</ul>`
    : '<p>មិនទាន់មានប្រភពបន្ថែម។</p>';

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
  <head><meta charset="utf-8"/><title>${escapeHtml(metadata.topic)}</title><style>
    @page { size: A4 portrait; margin: 1.35cm; }
    body { font-family: 'Khmer OS Battambang','Kantumruy Pro',Arial,sans-serif; font-size: 12pt; line-height: 1.45; color:#111; }
    h1,h2 { text-align:center; margin:4px 0 10px; } h3 { margin:12px 0 6px; }
    table { width:100%; border-collapse:collapse; margin:6px 0 12px; } th,td { border:1px solid #333; padding:6px; vertical-align:top; }
    th { background:#eee; } .center{text-align:center;} .box{border:1px solid #aaa;padding:9px;margin:8px 0;} .indent{margin-left:18px;}
    .answer{background:#edf7ef;border:1px solid #b8d8bf;padding:7px;margin:6px 0 12px;} .page-break{page-break-before:always;} .signature{width:100%;margin-top:18px;text-align:center;}
  </style></head><body>
    <div class="center"><strong>${escapeHtml(metadata.schoolName)}</strong><h1>កិច្ចតែងការបង្រៀន</h1></div>
    <h3>១-ព័ត៌មានទូទៅ</h3>
    <table>
      <tr><th>ជំពូក</th><td>${escapeHtml(curriculumAnchor?.chapter || 'ប្រធានបទកំណត់ដោយគ្រូ')}</td><th>មេរៀន</th><td>${escapeHtml(curriculumAnchor?.lesson)}</td></tr>
      <tr><th>ប្រធានបទ</th><td>${escapeHtml(metadata.topic)}</td><th>ថ្នាក់</th><td>${escapeHtml(metadata.grade)}</td></tr>
      <tr><th>មុខវិជ្ជា</th><td>${escapeHtml(metadata.subjectKm)}</td><th>រយៈពេល</th><td>${escapeHtml(metadata.duration)}</td></tr>
      <tr><th>គ្រូបង្រៀន</th><td>${escapeHtml(metadata.teacherName)}</td><th>កាលបរិច្ឆេទ</th><td>${escapeHtml(metadata.date)}</td></tr>
    </table>
    <h3>២-វត្ថុបំណង</h3>
    <table><tr><th>វិជ្ជាសម្បទា</th><td>${escapeHtml(objectives.knowledge)}</td></tr><tr><th>បំណិនសម្បទា</th><td>${escapeHtml(objectives.skills)}</td></tr><tr><th>ចរិយាសម្បទា</th><td>${escapeHtml(objectives.attitude)}</td></tr></table>
    <h3>៣-សម្ភារឧបទេស</h3><p>${materials.map(escapeHtml).join(' · ')}</p>
    <h3>៤-ខ្លឹមសារមេរៀន</h3><div class="box">${withBreaks(blackboardSummary)}</div>
    <h3>៥-ដំណើរការបង្រៀន និងរៀន (${escapeHtml(metadata.teachingMethodKm)})</h3>
    <table><thead><tr>${isFiveE ? '<th width="18%">5Es</th><th>សកម្មភាព</th><th width="12%">ចំនួននាទី</th>' : '<th>សកម្មភាពគ្រូ</th><th>ខ្លឹមសារមេរៀន</th><th>សកម្មភាពសិស្ស</th>'}</tr></thead><tbody>${processRows}</tbody></table>
    <table class="signature"><tr><td style="border:0">${escapeHtml(metadata.date)}<br/><strong>គ្រូបង្រៀន</strong><br/>${escapeHtml(metadata.teacherName)}</td><td style="border:0">បានពិនិត្យខ្លឹមសារ និងពេលវេលា<br/><strong>ហត្ថលេខា</strong><br/>................................</td></tr></table>
    <div class="page-break"></div><h2>${escapeHtml(fullWorksheet?.title || 'សន្លឹកកិច្ចការសិស្ស')}</h2>
    <div class="box"><strong>វត្ថុបំណង៖</strong> ${escapeHtml(worksheet.objective)}<br/><strong>ទិដ្ឋភាពទូទៅ៖</strong> ${escapeHtml(worksheet.backgroundKnowledge)}<br/><strong>សំណួរស្រាវជ្រាវ៖</strong> ${escapeHtml(worksheet.inquiryQuestion)}<br/><br/>${escapeHtml(worksheet.hypothesisPrompt)}</div>
    ${worksheet.materials?.length ? `<h3>សម្ភារៈ</h3><ul>${worksheet.materials.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
    ${worksheet.procedure?.length ? `<h3>ដំណើរការសកម្មភាព/ពិសោធ</h3><ol>${worksheet.procedure.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>` : ''}
    <table><tr><th>លទ្ធផល</th><th>សន្និដ្ឋាន</th></tr><tr><td>${escapeHtml(worksheet.resultsPrompt)}<br/><br/><br/></td><td>${escapeHtml(worksheet.conclusionPrompt)}<br/><br/><br/></td></tr></table>
    ${worksheetQuestions}${slidesHtml}
    <h3>ព្រំដែនកម្មវិធីសិក្សា ប្រភព និងសិទ្ធិប្រើប្រាស់</h3><p>${escapeHtml(curriculumAnchor?.scopeNoteKm)}</p><p>${escapeHtml(publication?.status || 'draft')} · ${escapeHtml(publication?.license || 'CC BY 4.0')}</p>${sourcesHtml}
  </body></html>`;
}

export function shareToTelegram(lessonPlan) {
  if (!lessonPlan) return;
  const { metadata, objectives } = lessonPlan;

  const text = `🇰🇭 *កិច្ចតែងការបង្រៀនលម្អិត (${metadata.teachingMethodKm})* 🇰🇭
📌 *ប្រធានបទ:* ${metadata.topic}
🏫 *សាលារៀន:* ${metadata.schoolName} | 👨‍🏫 *គ្រូបង្រៀន:* ${metadata.teacherName}
📚 *មុខវិជ្ជា:* ${metadata.subjectKm} (${metadata.grade}) | ⏱️ *រយៈពេល:* ${metadata.duration}
🔬 *បំណិនវិទ្យាសាស្ត្រ:* ${metadata.processSkillsKm}

🎯 *វត្ថុបំណង៖*
១. *ពុទ្ធិ:* ${objectives.knowledge}
២. *បំណិន:* ${objectives.skills}
៣. *ឥរិយាបថ:* ${objectives.attitude}

✨ បង្កើតដោយ KruAI (គ្រូ AI - កម្ពុជា)`;

  const encodedText = encodeURIComponent(text);
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent('https://kruai.gov.kh')}&text=${encodedText}`;
  window.open(telegramUrl, '_blank');
}

export function exportToWord(lessonPlan) {
  if (!lessonPlan) return;

  const {
    metadata,
    objectives,
    teachingAids,
    fiveStepsProcess,
    blackboardSummary,
    handsOnActivity,
    fullWorksheet,
    curriculumAnchor,
    enrichmentSources = [],
    publication,
  } = lessonPlan;

  if (metadata.templateProfile === 'happy-chandara-v1') {
    const htmlContent = buildHappyChandaraWordHtml(lessonPlan);
    const filename = `HappyChandara_LessonPlan_${metadata.subjectKm}_${metadata.topic.replace(/\s+/g, '_')}.doc`;
    downloadWordHtml(htmlContent, filename);
    return;
  }

  const processRowsHtml = fiveStepsProcess
    .map(
      (step) => `
      <tr>
        <td style="border:1px solid #999; padding:8px; font-weight:bold; background-color:#f0f7ff; text-align:left;">
          ${step.stepNameKm}<br/><small style="color:#555; font-weight:normal;">(${step.timeMins} នាទី)</small>
        </td>
        <td style="border:1px solid #999; padding:8px; text-align:left; white-space:pre-wrap;">${step.teacherActivity}</td>
        <td style="border:1px solid #999; padding:8px; text-align:left; white-space:pre-wrap;">${step.studentActivity}</td>
        <td style="border:1px solid #999; padding:8px; text-align:left;">${step.evaluation}</td>
      </tr>
    `
    )
    .join('');

  const worksheetHtml = fullWorksheet
    ? fullWorksheet.sections
        .map(
          (sec) => `
      <h4>${sec.sectionTitle}</h4>
      ${sec.questions
        .map(
          (q) => `
        <p><strong>សំណួរទី ${q.id}៖</strong> ${q.question}</p>
        ${q.options ? `<p style="margin-left:15px;">${q.options.join('<br/>')}</p>` : ''}
        <div style="background-color:#e6f4ea; border:1px solid #b7e1cd; padding:6px; margin-bottom:10px;">
          <strong>🔑 កូនសោចម្លើយគ្រូ៖</strong> ${q.correctAnswer}<br/>
          ${q.explanation ? `<small>💡 ${q.explanation}</small>` : ''}
        </div>
      `
        )
        .join('')}
    `
        )
        .join('')
    : '';

  const sourcesHtml = enrichmentSources.length
    ? `<ul>${enrichmentSources
        .map(
          (source) =>
            `<li><a href="${source.url}">${source.title}</a> - ${source.organization || ''} (${source.license})</li>`
        )
        .join('')}</ul>`
    : '<p>មិនទាន់មានប្រភពបន្ថែមដែលអាចតាមដានបាន។</p>';

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>កិច្ចតែងការ ${metadata.topic}</title>
      <style>
        body { font-family: 'Kantumruy Pro', 'Khmer OS Battambang', Arial, sans-serif; line-height: 1.6; }
        h1, h2, h3 { color: #0f4c81; text-align: center; }
        .header-table, .matrix-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .header-table td { padding: 6px; }
        .matrix-table th, .matrix-table td { border: 1px solid #666; padding: 8px; font-size: 13px; }
        .matrix-table th { background-color: #0f4c81; color: white; }
        .box { background-color: #f9f9f9; border: 1px solid #ddd; padding: 12px; margin-bottom: 15px; border-radius: 5px; }
        .blackboard-box { background-color: #1e293b; color: #38bdf8; padding: 12px; margin-bottom: 15px; border-radius: 5px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div style="text-align:center;">
        <h4>ព្រះរាជាណាចក្រកម្ពុជា<br/>ជាតិ សាសនា ព្រះមហាក្សត្រ</h4>
        <h2>កិច្ចតែងការបង្រៀនលម្អិត (${metadata.teachingMethodKm})</h2>
      </div>

      <table class="header-table" style="margin-bottom:20px;">
        <tr><td><strong>សាលារៀន៖</strong> ${metadata.schoolName}</td><td><strong>កាលបរិច្ឆេទ៖</strong> ${metadata.date}</td></tr>
        <tr><td><strong>គ្រូបង្រៀន៖</strong> ${metadata.teacherName}</td><td><strong>ថ្នាក់រៀន៖</strong> ${metadata.grade}</td></tr>
        <tr><td><strong>មុខវិជ្ជា៖</strong> ${metadata.subjectKm}</td><td><strong>រយៈពេល៖</strong> ${metadata.duration}</td></tr>
        <tr><td colspan="2"><strong>វិធីសាស្ត្របង្រៀន៖</strong> ${metadata.teachingMethodKm}</td></tr>
        <tr><td colspan="2"><strong>បំណិនវិទ្យាសាស្ត្រ (Process Skills)៖</strong> ${metadata.processSkillsKm}</td></tr>
        <tr><td colspan="2" style="font-size:16px; color:#0f4c81;"><strong>ប្រធានបទមេរៀន៖</strong> ${metadata.topic}</td></tr>
      </table>

      <h3>ព្រំដែនកម្មវិធីសិក្សា និងប្រភពបន្ថែម</h3>
      <div class="box">
        <p><strong>សៀវភៅ/កម្មវិធីសិក្សា៖</strong> ${curriculumAnchor?.officialBookTitle || 'ប្រធានបទកំណត់ដោយគ្រូ'}</p>
        <p><strong>ជំពូក៖</strong> ${curriculumAnchor?.chapter || 'ត្រូវផ្ទៀងផ្ទាត់'}</p>
        <p><strong>ស្ថានភាពផ្សព្វផ្សាយ៖</strong> ${publication?.status || 'draft'} · ${publication?.license || 'CC BY 4.0'}</p>
        ${sourcesHtml}
      </div>

      <h3>I. វត្ថុបំណង (Objectives)</h3>
      <div class="box">
        <p><strong>១. ពុទ្ធិ (Knowledge):</strong> ${objectives.knowledge}</p>
        <p><strong>២. បំណិន (Skills & Science Process):</strong> ${objectives.skills}</p>
        <p><strong>៣. ឥរិយាបថ (Attitude):</strong> ${objectives.attitude}</p>
      </div>

      ${
        blackboardSummary
          ? `
        <h3>ខ្លឹមសារមេរៀនសរសេរលើក្តារខៀន (Blackboard Notes Script)</h3>
        <div class="blackboard-box">
          <pre style="white-space:pre-wrap; font-family:monospace; margin:0;">${blackboardSummary}</pre>
        </div>
      `
          : ''
      }

      ${
        handsOnActivity
          ? `
        <h3>II. ${handsOnActivity.title}</h3>
        <div class="box">
          <p><strong>សម្ភារ និងឧបករណ៍៖</strong> ${handsOnActivity.materialsNeeded.join(', ')}</p>
          <p><strong>ជំហានអនុវត្ត៖</strong></p>
          <ul>${handsOnActivity.steps.map((s) => `<li>${s}</li>`).join('')}</ul>
        </div>
      `
          : ''
      }

      <h3>III. សម្ភារឧបទេស (Teaching Materials)</h3>
      <div class="box">
        <ul>${teachingAids.map((aid) => `<li>${aid}</li>`).join('')}</ul>
      </div>

      <h3>IV. ដំណើរការបង្រៀន និងរៀនលម្អិត (មានអត្ថបទនិយាយផ្ទាល់)</h3>
      <table class="matrix-table">
        <thead>
          <tr>
            <th width="20%">ជំហាន / រយៈពេល</th>
            <th width="40%">សកម្មភាពគ្រូ (TEACHER DIALOGUE SCRIPT)</th>
            <th width="25%">សកម្មភាពសិស្ស (STUDENT RESPONSE)</th>
            <th width="15%">ការវាយតម្លៃ</th>
          </tr>
        </thead>
        <tbody>
          ${processRowsHtml}
        </tbody>
      </table>

      ${
        fullWorksheet
          ? `
        <h3>V. ${fullWorksheet.title}</h3>
        <div class="box">
          <p><em>${fullWorksheet.instructions}</em></p>
          ${worksheetHtml}
        </div>
      `
          : ''
      }
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });

  const filename = `DetailedLessonPlan_${metadata.subjectKm}_${metadata.topic.replace(/\s+/g, '_')}.doc`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printLessonPlan() {
  window.print();
}
