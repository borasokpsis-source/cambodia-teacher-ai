// Export Utilities: Telegram Share, MS Word (.doc), and Printing for Cambodian Teachers

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
    misconceptionsAlert,
    differentiatedInstruction,
    assessmentRubric,
    fullWorksheet,
  } = lessonPlan;

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
