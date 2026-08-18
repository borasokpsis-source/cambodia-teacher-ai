// Ultra-Detailed Scripted AI Lesson Plan Generator for Cambodian MoEYS Teachers
import { SCIENCE_PROCESS_SKILLS, TEACHING_METHODS } from '../data/moeysCurriculum';
import {
  finalizeLessonPlan,
  formatContextForPrompt,
  resolveCurriculumAnchor,
  selectEnrichmentSources,
} from './curriculumContext';
import { generateOpenAILessonContent } from './openAILessonGenerator';
import { generateAnthropicLessonContent } from './anthropicLessonGenerator';

function getPhaseTimes(durationMins) {
  const presets = {
    45: [5, 15, 10, 10, 5],
    50: [5, 15, 15, 10, 5],
    60: [5, 20, 15, 15, 5],
    90: [10, 25, 20, 25, 10],
    120: [10, 35, 30, 30, 15],
  };
  if (presets[durationMins]) return presets[durationMins];

  const ratios = [0.1, 0.3, 0.25, 0.25];
  const firstFour = ratios.map((ratio) => Math.max(1, Math.round(durationMins * ratio)));
  const finalPhase = Math.max(1, durationMins - firstFour.reduce((sum, value) => sum + value, 0));
  return [...firstFour, finalPhase];
}

export async function generateMoEYSLessonPlan({
  schoolName = 'សាលាហេបភីច័ន្ទតារានារីព្រែកថ្មី',
  teacherName = 'សុខ បូរ៉ា',
  gradeLevel = 10,
  subjectId = 'biology',
  subjectNameKm = 'ជីវវិទ្យា',
  subjectNameEn = 'Biology',
  topic = 'ជំពូកទី ១៖ ភាពចម្រុះនៃជីវិត - មេរៀនទី ៣៖ ប្រូទីស',
  selectedSubtitles = [],
  customSessionFocus = '',
  durationMins = 90,
  resourceLevel = 'medium',
  teachingMethod = '5e_model',
  selectedSkills = ['observing', 'experimenting', 'interpreting'],
  enrichmentSources = [],
  allowOpenEnrichment = true,
  includeSlides = true,
  aiProvider = 'anthropic',
  apiKey = '',
}) {
  // Check if API key is provided directly, stored in localStorage, or configured in environment
  const envKey = import.meta.env?.VITE_GEMINI_API_KEY || '';
  const activeKey =
    apiKey || globalThis.localStorage?.getItem('kruai_gemini_key') || envKey || '';

  const dateStr = new Date().toLocaleDateString('km-KH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const methodObj = TEACHING_METHODS.find((m) => m.id === teachingMethod) || TEACHING_METHODS[1];
  const processSkillsList = SCIENCE_PROCESS_SKILLS.filter((s) => selectedSkills.includes(s.id));
  const processSkillsKm = processSkillsList.map((s) => s.nameKm).join(', ') || 'ការសង្កេត, ការពិសោធន៍/អនុវត្តផ្ទាល់, ការបកស្រាយទិន្នន័យ';
  const phaseTimes = getPhaseTimes(durationMins);
  const normalizedSubtitles = [...new Set(
    (Array.isArray(selectedSubtitles) ? selectedSubtitles : [])
      .map((subtitle) => String(subtitle).trim())
      .filter(Boolean)
  )];
  const normalizedCustomFocus = String(customSessionFocus || '').trim();
  const hasRestrictedSessionScope =
    normalizedSubtitles.length > 0 || Boolean(normalizedCustomFocus);
  const sessionTitle =
    normalizedSubtitles.join(' · ') || normalizedCustomFocus || topic;
  const contentTarget = [normalizedSubtitles.join('; '), normalizedCustomFocus]
    .filter(Boolean)
    .join('; ') || topic;
  const sessionMetadata = {
    topic: sessionTitle,
    parentLesson: topic,
    sessionTitle,
    selectedSubtitles: normalizedSubtitles,
    customSessionFocus: normalizedCustomFocus,
    sessionScope: contentTarget,
    isSessionScoped: hasRestrictedSessionScope,
  };
  const curriculumBaseAnchor = resolveCurriculumAnchor({
    gradeLevel,
    subjectId,
    subjectNameKm,
    subjectNameEn,
    topic,
  });
  const curriculumAnchor = {
    ...curriculumBaseAnchor,
    sessionTitle,
    selectedSubtitles: normalizedSubtitles,
    customSessionFocus: normalizedCustomFocus,
    sessionScope: contentTarget,
    scopeNoteKm: hasRestrictedSessionScope
      ? 'មេរៀនក្នុងសៀវភៅពុម្ពជាព្រំដែនកម្មវិធីសិក្សា; កិច្ចតែងការនេះបង្រៀន និងវាយតម្លៃតែចំណងជើងរង ឬគោលដៅសម័យដែលបានជ្រើសប៉ុណ្ណោះ។'
      : curriculumBaseAnchor.scopeNoteKm,
  };
  const selectedEnrichmentSources = selectEnrichmentSources({
    subjectId,
    selectedSources: enrichmentSources,
    allowOpenEnrichment,
  });
  const curriculumAndSourceContext = formatContextForPrompt(
    curriculumAnchor,
    selectedEnrichmentSources
  );

  // -------------------------------------------------------------
  // REMOTE AI PROVIDERS (OpenAI/Anthropic server proxies or Gemini browser key)
  // -------------------------------------------------------------
  // Helper to parse JSON cleanly even if wrapped in markdown codeblocks
  const cleanAndParseJSON = (rawText) => {
    if (!rawText) return null;
    let text = rawText.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(text);
  };

  // -------------------------------------------------------------
  // REAL GEMINI API CALL (If API Key exists)
  // -------------------------------------------------------------
  let lastApiError = null;

  if (aiProvider === 'openai') {
    try {
      const openAIResult = await generateOpenAILessonContent({
        schoolName,
        teacherName,
        gradeLevel,
        subjectNameKm,
        subjectNameEn,
        topic,
        selectedSubtitles: normalizedSubtitles,
        customSessionFocus: normalizedCustomFocus,
        durationMins,
        resourceLevel,
        methodNameKm: methodObj.nameKm,
        methodNameEn: methodObj.nameEn,
        processSkillsKm,
        phaseTimes,
        curriculumAndSourceContext,
      });
      const responseJson = cleanAndParseJSON(openAIResult.rawText);

      if (
        !responseJson?.objectives ||
        !Array.isArray(responseJson?.fiveStepsProcess) ||
        !Array.isArray(responseJson?.fullWorksheet?.sections)
      ) {
        throw new Error('OpenAI returned an incomplete lesson-plan structure.');
      }

      return finalizeLessonPlan({
        metadata: {
          id: 'LP-OPENAI-' + Date.now().toString().slice(-6),
          generatedAt: new Date().toISOString(),
          schoolName,
          teacherName,
          grade: `ថ្នាក់ទី ${gradeLevel}`,
          subjectKm: subjectNameKm,
          subjectEn: subjectNameEn,
          ...sessionMetadata,
          duration: `${durationMins} នាទី (Minutes)`,
          durationMins,
          date: dateStr,
          resourceLevel,
          teachingMethodKm: methodObj.nameKm,
          teachingMethodEn: methodObj.nameEn,
          teachingMethodId: teachingMethod,
          processSkillsKm,
          includeSlides,
          isRealAiGenerated: true,
          aiProvider: 'openai',
          aiProviderRequested: aiProvider,
          aiModelUsed: openAIResult.model,
          apiRequestId: openAIResult.responseId,
          apiUsage: openAIResult.usage,
          contentProfile: 'topic-specific',
        },
        objectives: responseJson.objectives,
        blackboardSummary: responseJson.blackboardSummary || `មេរៀន៖ ${sessionTitle}`,
        misconceptionsAlert: responseJson.misconceptionsAlert,
        differentiatedInstruction: responseJson.differentiatedInstruction,
        assessmentRubric: responseJson.assessmentRubric,
        handsOnActivity: responseJson.handsOnActivity,
        teachingAids: responseJson.teachingAids || [
          `សៀវភៅពុម្ពក្រសួងអប់រំ យុវជន និងកីឡា (${subjectNameKm} ថ្នាក់ទី ${gradeLevel})`,
          'រូបភាពតំណាង និងសម្ភារអនុវត្តដែលសមស្របនឹងមេរៀន',
          'សន្លឹកកិច្ចការសិស្ស និងក្រដាសផ្ទាំងធំ',
        ],
        fiveStepsProcess: responseJson.fiveStepsProcess,
        fullWorksheet: responseJson.fullWorksheet,
      }, {
        anchor: curriculumAnchor,
        sources: selectedEnrichmentSources,
        sourceUsage: 'prompt-reference',
      });
    } catch (error) {
      console.error('OpenAI API call failed, switching to local draft engine:', error);
      lastApiError = `OpenAI: ${error.message || 'API request failed'}`;
    }
  }

  if (aiProvider === 'anthropic') {
    try {
      const anthropicResult = await generateAnthropicLessonContent({
        schoolName,
        teacherName,
        gradeLevel,
        subjectNameKm,
        subjectNameEn,
        topic,
        selectedSubtitles: normalizedSubtitles,
        customSessionFocus: normalizedCustomFocus,
        durationMins,
        resourceLevel,
        methodNameKm: methodObj.nameKm,
        methodNameEn: methodObj.nameEn,
        processSkillsKm,
        phaseTimes,
        curriculumAndSourceContext,
      });
      const responseJson = cleanAndParseJSON(anthropicResult.rawText);

      if (
        !responseJson?.objectives ||
        !Array.isArray(responseJson?.fiveStepsProcess) ||
        !Array.isArray(responseJson?.fullWorksheet?.sections)
      ) {
        throw new Error('Claude returned an incomplete lesson-plan structure.');
      }

      return finalizeLessonPlan(
        {
          metadata: {
            id: 'LP-CLAUDE-' + Date.now().toString().slice(-6),
            generatedAt: new Date().toISOString(),
            schoolName,
            teacherName,
            grade: `ថ្នាក់ទី ${gradeLevel}`,
            subjectKm: subjectNameKm,
            subjectEn: subjectNameEn,
            ...sessionMetadata,
            duration: `${durationMins} នាទី (Minutes)`,
            durationMins,
            date: dateStr,
            resourceLevel,
            teachingMethodKm: methodObj.nameKm,
            teachingMethodEn: methodObj.nameEn,
            teachingMethodId: teachingMethod,
            processSkillsKm,
            includeSlides,
            isRealAiGenerated: true,
            aiProvider: 'anthropic',
            aiProviderRequested: aiProvider,
            aiModelUsed: anthropicResult.model,
            apiRequestId: anthropicResult.responseId,
            apiUsage: anthropicResult.usage,
            apiStopReason: anthropicResult.stopReason,
            contentProfile: 'topic-specific',
          },
          objectives: responseJson.objectives,
          blackboardSummary: responseJson.blackboardSummary || `មេរៀន៖ ${sessionTitle}`,
          misconceptionsAlert: responseJson.misconceptionsAlert,
          differentiatedInstruction: responseJson.differentiatedInstruction,
          assessmentRubric: responseJson.assessmentRubric,
          handsOnActivity: responseJson.handsOnActivity,
          teachingAids: responseJson.teachingAids || [
            `សៀវភៅពុម្ពក្រសួងអប់រំ យុវជន និងកីឡា (${subjectNameKm} ថ្នាក់ទី ${gradeLevel})`,
            'រូបភាពតំណាង និងសម្ភារអនុវត្តដែលសមស្របនឹងមេរៀន',
            'សន្លឹកកិច្ចការសិស្ស និងក្រដាសផ្ទាំងធំ',
          ],
          fiveStepsProcess: responseJson.fiveStepsProcess,
          fullWorksheet: responseJson.fullWorksheet,
        },
        {
          anchor: curriculumAnchor,
          sources: selectedEnrichmentSources,
          sourceUsage: 'prompt-reference',
        },
      );
    } catch (error) {
      console.error('Anthropic API call failed, switching to local draft engine:', error);
      lastApiError = `Anthropic: ${error.message || 'API request failed'}`;
    }
  }

  if (aiProvider === 'gemini' && activeKey && activeKey.trim().length > 10) {
    try {
      const prompt = `
You are an independent expert teacher and curriculum writer creating classroom materials aligned with Cambodia's Ministry of Education, Youth and Sport (MoEYS) curriculum.
Generate an ultra-detailed, scripted, 100% Khmer Unicode lesson plan in JSON format for a real Cambodian classroom.

Lesson Context:
- School: ${schoolName}
- Teacher: ${teacherName}
- Grade: Grade ${gradeLevel} (ថ្នាក់ទី ${gradeLevel})
- Subject: ${subjectNameKm} (${subjectNameEn})
- Parent textbook lesson: ${topic}
- Exact target for this teaching session: ${contentTarget}
- Selected subtitles: ${normalizedSubtitles.length ? normalizedSubtitles.join('; ') : 'Whole lesson'}
- Teacher-entered session focus: ${normalizedCustomFocus || 'None'}
- Duration: ${durationMins} minutes
- Teaching Framework: ${methodObj.nameKm} (${methodObj.nameEn})
- Target Science Process Skills: ${processSkillsKm}

${curriculumAndSourceContext}

CRITICAL INSTRUCTIONS FOR TOPIC ACCURACY & QUALITY:
1. The parent textbook lesson is "${topic}", and the exact target for THIS session is "${contentTarget}".
2. Every section of the lesson plan (Objectives, Blackboard Notes, Misconceptions Alert, Differentiated Instruction, Assessment Rubric, Hands-On Activity/Experiment, Teaching Aids, Teacher Dialogue, Student Responses, and complete 5-question Worksheet with Answer Key) MUST stay specific to "${contentTarget}" and within the parent lesson boundary.
3. ${hasRestrictedSessionScope ? 'Teach and assess ONLY the selected subtitles and teacher-entered focus. Do not include unselected subtitles except as one brief contextual connection.' : 'Cover the parent lesson as the session target.'} DO NOT output content for an unrelated topic.
4. Provide realistic Khmer teacher dialogue scripts ("🗣️ **ពាក្យសម្តីគ្រូនិយាយផ្ទាល់៖**..."), expected student responses ("🙋‍♂️ **ចម្លើយសិស្សរំពឹងទុក៖**..."), and curriculum-aligned Khmer terminology.
5. The five teaching phase times MUST add up to exactly ${durationMins} minutes. Use this allocation: ${phaseTimes.join(' + ')} minutes.

Return ONLY valid JSON matching this exact structure:
{
  "objectives": {
    "knowledge": "...",
    "skills": "...",
    "attitude": "..."
  },
  "blackboardSummary": "...",
  "misconceptionsAlert": {
    "title": "⚠️ ការយល់ច្រឡំប្រចាំមេរៀន និងវិធីកែសម្រួលគំនិត",
    "commonMisconception": "...",
    "diagnosticQuestion": "...",
    "teacherIntervention": "..."
  },
  "differentiatedInstruction": {
    "title": "🪜 ការបង្រៀនតាមកម្រិតសមត្ថភាពសិស្ស",
    "fastLearners": "...",
    "strugglingLearners": "...",
    "specialNeeds": "..."
  },
  "assessmentRubric": {
    "title": "📊 រ៉ូប៊្រីកវាយតម្លៃកម្រិតសមត្ថភាពសិស្ស",
    "levels": [
      { "levelKm": "កម្រិត ៤ - ល្អប្រសើរ (90-100%)", "criteria": "...", "badgeColor": "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
      { "levelKm": "កម្រិត ៣ - ល្អ (75-89%)", "criteria": "...", "badgeColor": "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
      { "levelKm": "កម្រិត ២ - មធ្យម (60-74%)", "criteria": "...", "badgeColor": "text-amber-400 bg-amber-500/10 border-amber-500/30" },
      { "levelKm": "កម្រិត ១ - ត្រូវកែលម្អ (<60%)", "criteria": "...", "badgeColor": "text-rose-400 bg-rose-500/10 border-rose-500/30" }
    ]
  },
  "handsOnActivity": {
    "title": "សកម្មភាពអនុវត្តផ្ទាល់ដៃ: ${sessionTitle}",
    "materialsNeeded": ["...", "..."],
    "steps": ["...", "..."],
    "thinkingPrompts": ["...", "..."]
  },
  "teachingAids": ["...", "..."],
  "fiveStepsProcess": [
    {
      "stepIndex": 1,
      "stepNameKm": "១. ចូលរួម (ENGAGE)",
      "timeMins": ${phaseTimes[0]},
      "teacherActivity": "🗣️ **ពាក្យសម្តីគ្រូនិយាយផ្ទាល់៖**\\n...",
      "studentActivity": "🙋‍♂️ **ចម្លើយសិស្សរំពឹងទុក៖**\\n...",
      "evaluation": "..."
    },
    {
      "stepIndex": 2,
      "stepNameKm": "២. ស្វែងយល់ (EXPLORE)",
      "timeMins": ${phaseTimes[1]},
      "teacherActivity": "...",
      "studentActivity": "...",
      "evaluation": "..."
    },
    {
      "stepIndex": 3,
      "stepNameKm": "៣. ពន្យល់ (EXPLAIN)",
      "timeMins": ${phaseTimes[2]},
      "teacherActivity": "...",
      "studentActivity": "...",
      "evaluation": "..."
    },
    {
      "stepIndex": 4,
      "stepNameKm": "៤. ពង្រីក (ELABORATE)",
      "timeMins": ${phaseTimes[3]},
      "teacherActivity": "...",
      "studentActivity": "...",
      "evaluation": "..."
    },
    {
      "stepIndex": 5,
      "stepNameKm": "៥. វាយតម្លៃ (EVALUATION)",
      "timeMins": ${phaseTimes[4]},
      "teacherActivity": "...",
      "studentActivity": "...",
      "evaluation": "..."
    }
  ],
  "fullWorksheet": {
    "title": "សន្លឹកកិច្ចការសិស្ស ៥ សំណួរពេញលេញ: ${sessionTitle}",
    "instructions": "ឈ្មោះសិស្ស៖ ............................................. ថ្នាក់ទី៖ ......... កាលបរិច្ឆេទ៖ .....................",
    "sections": [
      {
        "sectionTitle": "ផ្នែកទី ១៖ សំណួរជ្រើសរើសចម្លើយត្រឹមត្រូវ (Multiple Choice Questions)",
        "questions": [
          { "id": 1, "question": "...", "options": ["ក...", "ខ...", "គ...", "ឃ..."], "correctAnswer": "...", "explanation": "..." },
          { "id": 2, "question": "...", "options": ["ក...", "ខ...", "គ...", "ឃ..."], "correctAnswer": "...", "explanation": "..." }
        ]
      },
      {
        "sectionTitle": "ផ្នែកទី ២៖ សំណួរបំពេញចន្លោះ (Fill-in-the-Blanks)",
        "questions": [
          { "id": 3, "question": "...", "correctAnswer": "...", "explanation": "..." },
          { "id": 4, "question": "...", "correctAnswer": "...", "explanation": "..." }
        ]
      },
      {
        "sectionTitle": "ផ្នែកទី ៣៖ សំណួរត្រិះរិះ និងការវិភាគ (Structured Inquiry)",
        "questions": [
          { "id": 5, "question": "...", "correctAnswer": "...", "explanation": "..." }
        ]
      }
    ]
  }
}
      `;

      // Official & standard Gemini API models
      const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-lite'];
      let responseJson = null;
      let usedModel = null;

      for (const model of models) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey.trim()}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: 'application/json' },
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              responseJson = cleanAndParseJSON(rawText);
              if (responseJson && responseJson.objectives && responseJson.fiveStepsProcess) {
                usedModel = model;
                console.log(`Successfully generated lesson plan with Gemini API (${model})!`);
                break;
              }
            }
          } else {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${res.status}`;
            console.warn(`Gemini API model ${model} failed: ${errMsg}`);
            lastApiError = `Gemini (${model}): ${errMsg}`;
          }
        } catch (e) {
          console.warn(`Attempt with ${model} failed, trying fallback...`, e);
          lastApiError = e.message || `Network error with ${model}`;
        }
      }

      if (responseJson && responseJson.objectives && responseJson.fiveStepsProcess) {
        return finalizeLessonPlan({
          metadata: {
            id: 'LP-AI-' + Date.now().toString().slice(-6),
            generatedAt: new Date().toISOString(),
            schoolName,
            teacherName,
            grade: `ថ្នាក់ទី ${gradeLevel}`,
            subjectKm: subjectNameKm,
            subjectEn: subjectNameEn,
            ...sessionMetadata,
            duration: `${durationMins} នាទី (Minutes)`,
            durationMins,
            date: dateStr,
            resourceLevel,
            teachingMethodKm: methodObj.nameKm,
            teachingMethodEn: methodObj.nameEn,
            teachingMethodId: teachingMethod,
            processSkillsKm,
            includeSlides,
            isRealAiGenerated: true,
            aiProvider: 'gemini',
            aiProviderRequested: aiProvider,
            aiModelUsed: usedModel,
          },
          objectives: responseJson.objectives,
          blackboardSummary: responseJson.blackboardSummary || `មេរៀន៖ ${sessionTitle}`,
          misconceptionsAlert: responseJson.misconceptionsAlert,
          differentiatedInstruction: responseJson.differentiatedInstruction,
          assessmentRubric: responseJson.assessmentRubric,
          handsOnActivity: responseJson.handsOnActivity,
          teachingAids: responseJson.teachingAids || [
            `សៀវភៅពុម្ពក្រសួងអប់រំ យុវជន និងកីឡា (${subjectNameKm} ថ្នាក់ទី ${gradeLevel})`,
            'រូបភាពតំណាង និងសម្ភារពិសោធន៍/កែច្នៃ',
            'សន្លឹកកិច្ចការ និងក្រដាសផ្ទាំងធំ (Flipchart)',
          ],
          fiveStepsProcess: responseJson.fiveStepsProcess,
          fullWorksheet: responseJson.fullWorksheet,
        }, {
          anchor: curriculumAnchor,
          sources: selectedEnrichmentSources,
          sourceUsage: 'prompt-reference',
        });
      }
    } catch (err) {
      console.error('Gemini API call failed, switching to local dynamic generator:', err);
      lastApiError = err.message || 'Gemini API Exception';
    }
  }

  // -------------------------------------------------------------
  // DYNAMIC TOPIC-SPECIFIC LOCAL ENGINE (Fallback)
  // -------------------------------------------------------------
  await new Promise((res) => setTimeout(res, 1000));

  const topicLower = contentTarget.toLowerCase();
  const isProtist = !hasRestrictedSessionScope &&
    (topicLower.includes('ប្រូទីស') || topicLower.includes('protist'));
  const isPhotosynthesis = !hasRestrictedSessionScope &&
    (topicLower.includes('រស្មីសំយោគ') || topicLower.includes('photosynthesis'));
  const isSpeedVelocity =
    !hasRestrictedSessionScope &&
    (topicLower.includes('វ៉ិចទ័រល្បឿន') ||
      topicLower.includes('velocity') ||
      topicLower.includes('speed and velocity'));

  let blackboardSummary = '';
  let misconceptionsAlert = null;
  let handsOnActivity = null;
  let processMatrix = [];
  let fullWorksheet = null;
  let objectives = null;

  if (isProtist) {
    // ---------------- PROTISTS TOPIC (ប្រូទីស) ----------------
    objectives = {
      knowledge: `សិស្សអាចរៀបរាប់ និងពន្យល់ពីលក្ខណៈទូទៅ ចំណែកថ្នាក់នៃប្រូទីស (ប្រូទីសដូចសត្វ ដូចរុក្ខជាតិ និង ដូចផ្សិត) ព្រមទាំងតួនាទីរបស់វាក្នុងប្រព័ន្ធអេកូឡូស៊ីបានយ៉ាងច្បាស់លាស់។`,
      skills: `សិស្សអភិវឌ្ឍបំណិនដំណើរការវិទ្យាសាស្ត្រ (${processSkillsKm}) តាមរយៈការសង្កេតគំរូតំណាង (អាមីប ប៉ារ៉ាមេស៊ី អ៊ុយគ្លែន) ក្រោមមីក្រូទស្សន៍/រូបភាព និងការចាត់ថ្នាក់ប្រូទីស។`,
      attitude: `បណ្ដុះស្មារតីសិស្សឱ្យមានការប្រុងប្រយ័ត្នថែរក្សាអនាម័យប្រភពទឹកស្អាត និងយល់ដឹងពីជំងឺបង្កដោយប្រូទីស (ឧ. ជំងឺគ្រុនចាញ់)។`,
    };

    blackboardSummary = `ជំពូកទី ១៖ ភាពចម្រុះនៃជីវិត - មេរៀនទី ៣៖ ប្រូទីស (Protists)
១. និយមន័យ៖ ប្រូទីស ជាសារពាង្គកាយអឺការីយូត (Eukaryotes) សាមញ្ញ ដែលភាគច្រើនជាសារពាង្គកាយឯកកោសិកា ឬ ពហុកោសិកាសាមញ្ញ រស់នៅក្នុងមជ្ឈដ្ឋានទឹក ឬ ដើមកើនសំណើម។
២. ចំណែកថ្នាក់ប្រូទីស៖
   - ប្រូទីសដូចសត្វ (Protozoa)៖ គ្មានក្លរ៉ូភីល ផ្លាស់ទីបាន (ឧ. អាមីប Amoeba, ប៉ារ៉ាមេស៊ី Paramecium, ប្លាស្ម៉ូឌ្យូម Plasmodium បង្កជំងឺគ្រុនចាញ់)។
   - ប្រូទីសដូចរុក្ខជាតិ (Algae - អាល់ក)៖ មានក្លរ៉ូភីល ធ្វើរស្មីសំយោគបាន (ឧ. អ៊ុយគ្លែន Euglena, ឌីយ៉ាតូម Diatoms, អាល់កបៃតង)។
   - ប្រូទីសដូចផ្សិត (Slime Molds)៖ ស្រូបយកសារធាតុចិញ្ចឹមពីរូបធាតុរលួយ។
៣. សារៈសំខាន់ និង ជំងឺ៖
   - ជាអ្នកផលិតអុកស៊ីសែន និង អាហារគ្រឹះក្នុងទឹក (Phytoplankton)។
   - ប្រូទីសប៉ារ៉ាស៊ីតបង្កជំងឺគ្រុនចាញ់ (Plasmodium តាមរយៈមូសដែកគោល) និង ជំងឺរាគរូស (Entamoeba)។`;

    misconceptionsAlert = {
      title: `⚠️ ការយល់ច្រឡំប្រចាំមេរៀន និងវិធីកែសម្រួលគំនិត (Misconception & Diagnostic Alert)`,
      commonMisconception: `សិស្សភាគច្រើនតែងតែយល់ច្រឡំថា ប្រូទីស គឺជាបាក់តេរី ឬ គិតថាប្រូទីសទាំងអស់សុទ្ធតែជាភ្នាក់ងារបង្កជំងឺគ្រោះថ្នាក់។`,
      diagnosticQuestion: `❓ សំណួរស្ទង់គំនិតគ្រូត្រូវសួរ៖ "តើអាល់ក (Algae) នៅក្នុងទឹកស្រះ ជាបាក់តេរី ឬ ជាប្រូទីស? តើវាអាចធ្វើរស្មីសំយោគបានទេ?"`,
      teacherIntervention: `💡 វិធីកែសម្រួល៖ គ្រូពន្យល់ថា ប្រូទីសជា អឺការីយូត (មានណ្វាយ៉ូពិតប្រាកដ) ខុសពីបាក់តេរី (ប្រូការីយូត) ហើយប្រូទីសភាគច្រើនជាអ្នកផលិតអុកស៊ីសែនដ៏សំខាន់ក្នុងពិភពលោក!`,
    };

    handsOnActivity = {
      title: `សកម្មភាពសង្កេត និងចាត់ថ្នាក់ប្រូទីស (Hands-On Observation Blueprint): ប្រូទីស`,
      materialsNeeded: [
        'ទឹកស្រះ/ទឹកត្រពាំងមានបាយទា ឬ គំរូទឹកត្រាំចើងរុក្ខជាតិ',
        'មីក្រូទស្សន៍ ឬ រូបភាពពង្រីកធំនៃ អាមីប ប៉ារ៉ាមេស៊ី និង អ៊ុយគ្លែន',
        'កញ្ចក់ស្លាយ, កញ្ចក់គ្រប, បំពង់បឺត (Dropper), និង សន្លឹកកិច្ចការសង្កេត',
      ],
      steps: [
        '១. បឺតដំណក់ទឹកស្រះ ១ ដំណក់ដាក់លើកញ្ចក់ស្លាយ រួចគ្របកញ្ចក់គ្របឱ្យបានត្រឹមត្រូវ។',
        '២. ដាក់កញ្ចក់ស្លាយក្រោមមីក្រូទស្សន៍ (ពង្រីក 10x និង 40x) ដើម្បីសង្កេតមើលចលនាអាមីប (ជើងក្លែងក្លាយ) ឬ ប៉ារ៉ាមេស៊ី (រោមញ័រ)។',
        '៣. សិស្សគូររូបរាងប្រូទីសដែលបានសង្កេតឃើញ និង ចាត់ថ្នាក់វាជា ៣ ក្រុម (ដូចសត្វ ដូចរុក្ខជាតិ ដូចផ្សិត)។',
        '៤. ពិភាក្សាជាក្រុមពីវិធីសាស្ត្រផ្លាស់ទី និង ការស្រូបយកអាហាររបស់ប្រូទីសនីមួយៗ។',
      ],
      thinkingPrompts: [
        '• សំណួរវិភាគ (Analyze): "តើអ៊ុយគ្លែន (Euglena) មានលក្ខណៈខុសប្លែកពីប្រូទីសដទៃទៀតយ៉ាងដូចម្តេច? (វាអាចធ្វើរស្មីសំយោគផង និង ស៊ីអាហារខាងក្រៅផង)"',
        '• សំណួរវាយតម្លៃ (Evaluate): "តើប្រូទីសមានតួនាទីយ៉ាងដូចម្តេចក្នុងការទ្រទ្រង់ជីវិតមច្ឆជាតិក្នុងប្រព័ន្ធអេកូឡូស៊ីទឹក?"',
      ],
    };

    processMatrix = [
      {
        stepIndex: 1,
        stepNameKm: '១. ចូលរួម (ENGAGE)',
        timeMins: 5,
        teacherActivity: `🗣️ **ពាក្យសម្តីគ្រូនិយាយផ្ទាល់៖**\n"សួស្តីប្អូនៗ! ពេលប្អូនៗមើលទឹកស្រះ ឬ ទឹកត្រពាំងឃើញមានពណ៌បៃតង តើប្អូនៗគិតថាមានសារពាង្គកាយរស់អ្វីខ្លះនៅក្នុងនោះ? តើវាជាបាក់តេរី ឬ ជាអ្វី?"\n\n• គ្រូបង្ហាញដបទឹកស្រះពណ៌បៃតង និង រូបភាពពង្រីកនៃ អាមីប និង ប៉ារ៉ាមេស៊ី ជូនសិស្សមើលផ្ទាល់។`,
        studentActivity: `🙋‍♂️ **ចម្លើយសិស្សរំពឹងទុក៖**\n"សិស្សឆ្លើយ៖ លោកគ្រូ/អ្នកគ្រូ! នៅក្នុងទឹកស្រះមានស្លែ និង សត្វល្អិតតូចៗមើលមិនឃើញនឹងភ្នែកទទេ។ វាអាចជាប្រូទីស!"\n\n• សិស្សចូលរួមសង្កេត និងចោទសំនួរ៖ "តើប្រូទីសខុសពីបាក់តេរី និង សត្វយ៉ាងដូចម្តេច?"`,
        evaluation: 'សង្កេតភាពឆ្ងល់ និងការចូលរួមឆ្លើយសំណួររបស់សិស្ស',
      },
      {
        stepIndex: 2,
        stepNameKm: '២. ស្វែងយល់ (EXPLORE - Hands-On Observation)',
        timeMins: 15,
        teacherActivity: `🗣️ **ពាក្យសម្តីគ្រូណែនាំសកម្មភាព៖**\n"ឥឡូវនេះ គ្រូនឹងចែកប្អូនៗជា ៤ ក្រុម! សូមយកគំរូទឹកស្រះទៅពិនិត្យក្រោមមីក្រូទស្សន៍ ឬ សង្កេតកាតរូបភាពចម្រុះ រួចគូររូបរាង និង ចាត់ថ្នាក់ប្រូទីសទាំងនោះ!"\n\n• គ្រូដើរសម្រួល ណែនាំការប្រើមីក្រូទស្សន៍ និង ជួយសិស្សរៀនយឺត (Scaffolding)។`,
        studentActivity: `🙋‍♂️ **សកម្មភាពសិស្សធ្វើផ្ទាល់ដៃ៖**\n• សិស្សរៀបចំស្លាយទឹកស្រះ និង សង្កេតមើលចលនាអាមីប (កម្រើកជើងក្លែងក្លាយ) ឬ ប៉ារ៉ាមេស៊ី។\n• កត់ត្រា និង គូររូបរាងប្រូទីសចូលសន្លឹកកិច្ចការក្រុម រួចចាត់ថ្នាក់ជា ប្រូទីសដូចសត្វ ដូចរុក្ខជាតិ ឬ ដូចផ្សិត។`,
        evaluation: 'វាយតម្លៃបំណិនសង្កេត និងការចាត់ថ្នាក់ប្រូទីស',
      },
      {
        stepIndex: 3,
        stepNameKm: '៣. ពន្យល់ (EXPLAIN)',
        timeMins: 10,
        teacherActivity: `🗣️ **ពាក្យសម្តីគ្រូសម្របសម្រួល៖**\n"សូមតំណាងក្រុមទី ២ និង ក្រុមទី ៤ ឡើងបកស្រាយលទ្ធផលសង្កេត! តើអាមីប និង អាល់កបៃតង មានលក្ខណៈខុសគ្នាយ៉ាងដូចម្តេច?"\n\n• គ្រូសរសេរចំនុចសំខាន់ៗនៃប្រូទីស និង ចំណែកថ្នាក់ទាំង ៣ ក្រុមលើក្តារខៀន។`,
        studentActivity: `🙋‍♂️ **ចម្លើយសិស្ស និងការកត់ត្រា៖**\n"តំណាងក្រុមឆ្លើយ៖ អាមីបជាប្រូទីសដូចសត្វ គ្មានក្លរ៉ូភីល និង ផ្លាស់ទីដោយជើងក្លែងក្លាយ! ឯអាល់កបៃតងជាប្រូទីសដូចរុក្ខជាតិ មានក្លរ៉ូភីលធ្វើរស្មីសំយោគ!"\n\n• សិស្សកត់ត្រាក្តារខៀនចូលសៀវភៅ។`,
        evaluation: 'វាយតម្លៃការយល់ដឹងពីចំណែកថ្នាក់ប្រូទីស',
      },
      {
        stepIndex: 4,
        stepNameKm: '៤. ពង្រីក (ELABORATE - Application)',
        timeMins: 10,
        teacherActivity: `🗣️ **ពាក្យសម្តីគ្រូចោទបញ្ហាអនុវត្ត៖**\n"ជំងឺគ្រុនចាញ់នៅប្រទេសកម្ពុជា បង្កឡើងដោយប្រូទីសឈ្មោះ ប្លាស្ម៉ូឌ្យូម (Plasmodium)។ តើវាឆ្លងតាមរបៀបណា? ហើយយើងគួរការពារខ្លួនយ៉ាងដូចម្តេច?"`,
        studentActivity: `🙋‍♂️ **ចម្លើយសិស្ស និងការពិភាក្សា៖**\n"សិស្សឆ្លើយ៖ ឆ្លងតាមរយៈការខាំនៃមូសដែកគោលញី! យើងត្រូវគេងក្នុងមុង និង បំផ្លាញជម្រកមូសដើម្បីការពារជំងឺគ្រុនចាញ់!"`,
        evaluation: 'ត្រួតពិនិត្យការអនុវត្តចំណេះដឹងក្នុងសុខភាពសហគមន៍',
      },
      {
        stepIndex: 5,
        stepNameKm: '៥. វាយតម្លៃ (EVALUATION)',
        timeMins: 5,
        teacherActivity: `🗣️ **ពាក្យសម្តីគ្រូសង្ខេប៖**\n"ល្អណាស់! សូមប្អូនៗបំពេញសន្លឹកកិច្ចការ ៥ សំណួរម្នាក់ៗរយៈពេល ៥ នាទី!"`,
        studentActivity: `🙋‍♂️ **សកម្មភាពសិស្ស៖**\n• សិស្សបំពេញសន្លឹកកិច្ចការ ៥ សំណួរម្នាក់ៗ និង កត់ត្រាកិច្ចការផ្ទះ។`,
        evaluation: 'វាយតម្លៃតាមរ៉ូប៊្រីក',
      },
    ];

    fullWorksheet = {
      title: `សន្លឹកកិច្ចការសិស្ស ៥ សំណួរពេញលេញ៖ មេរៀនទី ៣៖ ប្រូទីស (Protists)`,
      instructions: 'ឈ្មោះសិស្ស៖ ............................................. ថ្នាក់ទី៖ 10 កាលបរិច្ឆេទ៖ .....................',
      sections: [
        {
          sectionTitle: 'ផ្នែកទី ១៖ សំណួរជ្រើសរើសចម្លើយត្រឹមត្រូវ (Multiple Choice Questions)',
          questions: [
            {
              id: 1,
              question: `តើសារពាង្គកាយមួយណាខាងក្រោមនេះ ជាប្រូទីសដូចសត្វ (Protozoa) ដែលផ្លាស់ទីដោយប្រើប្រាស់ជើងក្លែងក្លាយ (Pseudopodia)?`,
              options: ['ក. ប៉ារ៉ាមេស៊ី (Paramecium)', 'ខ. អាមីប (Amoeba)', 'គ. អ៊ុយគ្លែន (Euglena)', 'ឃ. ផ្សិត'],
              correctAnswer: 'ខ. អាមីប (Amoeba)',
              explanation: 'អាមីបលាតសន្ធឹងស៊ីតូប្លាសបង្កើតជាជើងក្លែងក្លាយដើម្បីផ្លាស់ទី និង ចាប់ចំណី។',
            },
            {
              id: 2,
              question: `តើជំងឺគ្រុនចាញ់នៅប្រទេសកម្ពុជា បង្កឡើងដោយប្រូទីសប៉ារ៉ាស៊ីតមួយណា?`,
              options: ['ក. Plasmodium (ប្លាស្ម៉ូឌ្យូម)', 'ខ. Entamoeba', 'គ. Trypanosoma', 'ឃ. Penicillium'],
              correctAnswer: 'ក. Plasmodium (ប្លាស្ម៉ូឌ្យូម)',
              explanation: 'Plasmodium ជាប្រូទីសប៉ារ៉ាស៊ីតដែលចម្លងទៅមនុស្សតាមរយៈការខាំនៃមូសដែកគោលញី។',
            },
          ],
        },
        {
          sectionTitle: 'ផ្នែកទី ២៖ សំណួរបំពេញចន្លោះ (Fill-in-the-Blanks)',
          questions: [
            {
              id: 3,
              question: `ប្រូទីសដូចរុក្ខជាតិ (អាល់ក) មានជាតិពណ៌ ..................................... ដែលអាចស្រូបយកពន្លឺព្រះអាទិត្យដើម្បីធ្វើរស្មីសំយោគ។`,
              correctAnswer: 'ក្លរ៉ូភីល (Chlorophyll)',
              explanation: 'អាល់កជួយផលិតអុកស៊ីសែនយ៉ាងច្រើនក្នុងប្រព័ន្ធអេកូឡូស៊ីទឹក។',
            },
            {
              id: 4,
              question: `ប្រូទីស ជាសារពាង្គកាយអឺការីយូត ព្រោះកោសិកសារបស់វាមាន ..................................... ពិតប្រាកដ រុំព័ទ្ធដោយភ្នាស។`,
              correctAnswer: 'ណ្វាយ៉ូ (Nucleus)',
              explanation: 'ខុសពីបាក់តេរី (ប្រូការីយូត) ដែលគ្មានភ្នាសណ្វាយ៉ូ។',
            },
          ],
        },
        {
          sectionTitle: 'ផ្នែកទី ៣៖ សំណួរត្រិះរិះ និងការវិភាគ (Structured Inquiry)',
          questions: [
            {
              id: 5,
              question: `ចូរបកស្រាយ៖ ហេតុអ្វីបានជាគេចាត់ថ្នាក់ អ៊ុយគ្លែន (Euglena) ជាប្រូទីសពិសេស? ហើយតើវាមានប្រយោជន៍អ្វីខ្លះក្នុងប្រព័ន្ធអេកូឡូស៊ីទឹក?`,
              correctAnswer: `• ចម្លើយត្រឹមត្រូវ៖ អ៊ុយគ្លែនជាប្រូទីសពិសេស ព្រោះវាមានក្លរ៉ូភីលអាចធ្វើរស្មីសំយោគដូចរុក្ខជាតិពេលមានពន្លឺ ហើយពេលគ្មានពន្លឺ វាអាចផ្លាស់ទី និង ស៊ីអាហារខាងក្រៅដូចសត្វបាន។\n• ប្រយោជន៍៖ វាជាអ្នកផលិតអុកស៊ីសែន និង ជាប្រភពអាហារគ្រឹះ (Phytoplankton) សម្រាប់សត្វក្នុងទឹក។`,
              explanation: 'សំណួរនេះស្ទង់មើលបំណិនវិភាគ និង ការយល់ដឹងពីលក្ខណៈបត់បែននៃប្រូទីស។',
            },
          ],
        },
      ],
    };
  } else if (isPhotosynthesis) {
    // Photosynthesis topic logic
    objectives = {
      knowledge: `សិស្សអាចរៀបរាប់ និងពន្យល់ពីនិយមន័យ និងសមីការរស្មីសំយោគនៃ ${topic} បានយ៉ាងច្បាស់លាស់។`,
      skills: `សិស្សអភិវឌ្ឍបំណិនដំណើរការវិទ្យាសាស្ត្រ (${processSkillsKm}) តាមរយៈការពិសោធន៍ស្រក់អ៊ីយ៉ូដលើស្លឹករុក្ខជាតិ។`,
      attitude: `បណ្ដុះស្មារតីសិស្សឱ្យស្រឡាញ់រុក្ខជាតិ និង បរិស្ថាន។`,
    };
    blackboardSummary = `មេរៀន៖ រស្មីសំយោគ (Photosynthesis)\n១. និយមន័យ៖ រស្មីសំយោគ ជាដំណើរការដែលរុក្ខជាតិបៃតងប្រើប្រាស់ពន្លឺព្រះអាទិត្យ ឧស្ម័នកាបូនិច (CO2) និងទឹក (H2O) ដើម្បីផលិតអាហារ (គ្លុយកូស) និង បំភាយឧស្ម័នអុកស៊ីសែន (O2)។\n២. សមីការ៖ 6CO2 + 6H2O --[ពន្លឺ+ក្លរ៉ូភីល]--> C6H12O6 + 6O2`;
    misconceptionsAlert = {
      title: `⚠️ ការយល់ច្រឡំប្រចាំមេរៀន`,
      commonMisconception: `សិស្សយល់ច្រឡំថារុក្ខជាតិដកដង្ហើមតែនៅពេលយប់។`,
      diagnosticQuestion: `❓ "តើរុក្ខជាតិដកដង្ហើមនៅពេលថ្ងៃដែរឬទេ?"`,
      teacherIntervention: `💡 គ្រូពន្យល់ថារុក្ខជាតិដកដង្ហើម ២៤ ម៉ោង/ថ្ងៃ។`,
    };
    handsOnActivity = {
      title: `សកម្មភាពតេស្តអាមីដុងលើស្លឹករុក្ខជាតិ`,
      materialsNeeded: ['ស្លឹករុក្ខជាតិ', 'សូលុយស្យុងអ៊ីយ៉ូដ', 'អាល់កុល', 'ទឹកក្តៅ'],
      steps: ['១. ជ្រលក់ស្លឹកក្នុងទឹកក្តៅ', '២. ដាំក្នុងអាល់កុល', '៣. ស្រក់អ៊ីយ៉ូដ និងសង្កេត'],
      thinkingPrompts: ['• ហេតុអ្វីស្លឹកប្រែជាពណ៌ខៀវចាស់?'],
    };
    processMatrix = [
      { stepIndex: 1, stepNameKm: '១. ចូលរួម (ENGAGE)', timeMins: 5, teacherActivity: '🗣️ "សួស្តីប្អូនៗ! តើហេតុអ្វីស្លឹករុក្ខជាតិមានពណ៌បៃតង?"', studentActivity: '🙋‍♂️ "ព្រោះវាមានក្លរ៉ូភីល!"', evaluation: 'សង្កេត' },
      { stepIndex: 2, stepNameKm: '២. ស្វែងយល់ (EXPLORE)', timeMins: 15, teacherActivity: '🗣️ "ធ្វើពិសោធន៍ស្រក់អ៊ីយ៉ូដ!"', studentActivity: '🙋‍♂️ សិស្សធ្វើពិសោធន៍ និងកត់ត្រា', evaluation: 'វាយតម្លៃ' },
      { stepIndex: 3, stepNameKm: '៣. ពន្យល់ (EXPLAIN)', timeMins: 10, teacherActivity: '🗣️ "ពន្យល់សមីការរស្មីសំយោគ"', studentActivity: '🙋‍♂️ កត់ត្រាក្តារខៀន', evaluation: 'វាយតម្លៃ' },
      { stepIndex: 4, stepNameKm: '៤. ពង្រីក (ELABORATE)', timeMins: 10, teacherActivity: '🗣️ "អនុវត្តក្នុងផ្ទះកញ្ចក់"', studentActivity: '🙋‍♂️ ពិភាក្សា', evaluation: 'ត្រួតពិនិត្យ' },
      { stepIndex: 5, stepNameKm: '៥. វាយតម្លៃ (EVALUATION)', timeMins: 5, teacherActivity: '🗣️ "បំពេញសន្លឹកកិច្ចការ"', studentActivity: '🙋‍♂️ ធ្វើសន្លឹកកិច្ចការ', evaluation: 'វាយតម្លៃ' },
    ];
    fullWorksheet = {
      title: `សន្លឹកកិច្ចការ៖ រស្មីសំយោគ`,
      instructions: 'ឈ្មោះសិស្ស៖ .....................',
      sections: [{ sectionTitle: 'ផ្នែកទី ១', questions: [{ id: 1, question: 'តើរស្មីសំយោគបង្កើតអ្វីខ្លះ?', options: ['ក. គ្លុយកូស និង O2', 'ខ. CO2'], correctAnswer: 'ក. គ្លុយកូស និង O2' }] }],
    };
  } else if (isSpeedVelocity) {
    objectives = {
      knowledge: 'សិស្សអាចបែងចែកល្បឿន (បរិមាណស្កាលែ) និងវ៉ិចទ័រល្បឿន (បរិមាណវ៉ិចទ័រ) ព្រមទាំងប្រើរូបមន្ត v = d/t បានត្រឹមត្រូវ។',
      skills: `សិស្សអាចវាស់ចម្ងាយ និងពេលវេលា គណនាល្បឿនមធ្យម បង្ហាញទិសដៅដោយព្រួញ និងបកស្រាយទិន្នន័យដោយប្រើបំណិន ${processSkillsKm}។`,
      attitude: 'សិស្សធ្វើការជាក្រុមដោយសុវត្ថិភាព កត់ត្រាទិន្នន័យស្មោះត្រង់ និងយល់ពីសារៈសំខាន់នៃល្បឿនសុវត្ថិភាពលើដងផ្លូវ។',
    };

    blackboardSummary = `មេរៀន៖ ល្បឿន និងវ៉ិចទ័រល្បឿន
១. ល្បឿន (speed) ជាបរិមាណស្កាលែ៖ ល្បឿនមធ្យម = ចម្ងាយសរុប ÷ ពេលវេលាសរុប; v = d/t។
២. វ៉ិចទ័រល្បឿន (velocity) ជាបរិមាណវ៉ិចទ័រ៖ ត្រូវមានទំហំ និងទិសដៅ; វ៉ិចទ័រល្បឿនមធ្យម = បម្លាស់ទី ÷ ពេលវេលា។
៣. ឯកតា SI គឺ m/s; 1 m/s = 3.6 km/h។
៤. ចម្ងាយជាប្រវែងផ្លូវដែលបានធ្វើដំណើរ; បម្លាស់ទីជាបន្ទាត់ត្រង់ពីទីតាំងដើមទៅទីតាំងចុងក្រោយ និងមានទិសដៅ។
ឧទាហរណ៍៖ កង់ធ្វើដំណើរ 100 m ក្នុង 20 s មានល្បឿនមធ្យម 5 m/s។ បើត្រឡប់មកទីតាំងដើម បម្លាស់ទីស្មើ 0 ដូច្នេះវ៉ិចទ័រល្បឿនមធ្យមស្មើ 0 ទោះចម្ងាយមិនស្មើ 0 ក៏ដោយ។`;

    misconceptionsAlert = {
      title: '⚠️ ការយល់ច្រឡំ៖ ល្បឿន និងវ៉ិចទ័រល្បឿនមិនដូចគ្នាទេ',
      commonMisconception: 'សិស្សអាចគិតថា ល្បឿន និងវ៉ិចទ័រល្បឿនជាបរិមាណតែមួយ ឬច្រឡំចម្ងាយជាមួយបម្លាស់ទី។',
      diagnosticQuestion: '❓ សិស្សដើរ 10 m ទៅកើត រួចត្រឡប់ 10 m មកទីតាំងដើម។ តើចម្ងាយ និងបម្លាស់ទីស្មើប៉ុន្មាន?',
      teacherIntervention: '💡 គូសផ្លូវចេញ-ត្រឡប់លើក្តារ៖ ចម្ងាយសរុប = 20 m ប៉ុន្តែបម្លាស់ទី = 0 m។ ដូច្នេះល្បឿនមធ្យមមិនសូន្យ តែវ៉ិចទ័រល្បឿនមធ្យមសូន្យ។',
    };

    handsOnActivity = {
      title: 'សកម្មភាពវាស់ល្បឿនរថយន្តក្មេងលេង ឬដបរមៀល',
      materialsNeeded: ['រថយន្តក្មេងលេង ឬដបមានគម្រប', 'ម៉ែត្រវាស់ ឬខ្សែមានសញ្ញាចម្ងាយ', 'នាឡិកាកំណត់ពេល', 'កាសែតបិទសម្គាល់ទិស និងសន្លឹកតារាងទិន្នន័យ'],
      steps: [
        '១. សម្គាល់ផ្លូវត្រង់ប្រវែង 2 m និងគូសព្រួញបង្ហាញទិសទៅកើត។',
        '២. បញ្ចេញរថយន្តឱ្យធ្វើដំណើរ 2 m; វាស់ពេល 3 ដង និងកត់ត្រាជាវិនាទី។',
        '៣. គណនាពេលមធ្យម និងល្បឿនមធ្យម v = 2 m ÷ ពេលមធ្យម។',
        '៤. ឱ្យរថយន្តត្រឡប់មកទីតាំងដើម ហើយប្រៀបធៀបចម្ងាយសរុបជាមួយបម្លាស់ទី។',
      ],
      thinkingPrompts: [
        '• បើចម្ងាយដូចគ្នា តែពេលវេលាតិចជាង តើល្បឿនប្រែប្រួលដូចម្តេច?',
        '• ហេតុអ្វីការប្រាប់ថា “5 m/s” មិនទាន់គ្រប់គ្រាន់សម្រាប់វ៉ិចទ័រល្បឿន?',
      ],
    };

    processMatrix = [
      {
        stepIndex: 1,
        stepNameKm: '១. ចូលរួម (ENGAGE)',
        timeMins: 5,
        teacherActivity: '🗣️ “ម៉ូតូពីរគ្រឿងធ្វើដំណើរផ្ទុយទិសគ្នាក្នុងល្បឿន 30 km/h ដូចគ្នា។ តើចលនារបស់វាដូចគ្នាទាំងស្រុងឬទេ?” គ្រូប្រមូលមូលហេតុរបស់សិស្ស មិនទាន់ប្រាប់ចម្លើយ។',
        studentActivity: '🙋‍♂️ សិស្សទស្សន៍ទាយ និងពន្យល់ថា ទំហំល្បឿនដូចគ្នា ប៉ុន្តែទិសដៅខុសគ្នា។',
        evaluation: 'សំណួរស្ទង់គំនិតដើមអំពីទំហំ និងទិសដៅ',
      },
      {
        stepIndex: 2,
        stepNameKm: '២. ស្វែងយល់ (EXPLORE)',
        timeMins: 15,
        teacherActivity: '🗣️ “ក្នុងក្រុម សូមវាស់ផ្លូវ 2 m បញ្ចេញវត្ថុរមៀល និងវាស់ពេល 3 ដង។ កុំរុញខ្លាំងជិតមិត្តភក្តិ ហើយកត់ត្រាលទ្ធផលទាំងអស់।”',
        studentActivity: '🙋‍♂️ សិស្សកំណត់តួនាទី វាស់ចម្ងាយ/ពេល ធ្វើសាកល្បង 3 ដង គណនាពេលមធ្យម និងគូសព្រួញទិសដៅ។',
        evaluation: 'តារាងទិន្នន័យមានឯកតា និងការវាស់ 3 ដង',
      },
      {
        stepIndex: 3,
        stepNameKm: '៣. ពន្យល់ (EXPLAIN)',
        timeMins: 10,
        teacherActivity: '🗣️ “តើក្រុមគណនា v = d/t យ៉ាងដូចម្តេច? តើអ្វីត្រូវបន្ថែម ដើម្បីបម្លែងល្បឿនទៅជាវ៉ិចទ័រល្បឿន?” គ្រូសំយោគនិយមន័យ និងឯកតា។',
        studentActivity: '🙋‍♂️ តំណាងក្រុមបង្ហាញការគណនា ហើយសិស្សកែតម្រូវឯកតា និងបន្ថែមទិសដៅទៅវ៉ិចទ័រល្បឿន។',
        evaluation: 'ពិនិត្យរូបមន្ត ការជំនួសតម្លៃ ឯកតា និងទិសដៅ',
      },
      {
        stepIndex: 4,
        stepNameKm: '៤. ពង្រីក (ELABORATE)',
        timeMins: 10,
        teacherActivity: '🗣️ “បើវត្ថុទៅ 2 m ហើយត្រឡប់ 2 m ក្នុង 8 s តើល្បឿនមធ្យម និងវ៉ិចទ័រល្បឿនមធ្យមខុសគ្នាយ៉ាងដូចម្តេច?”',
        studentActivity: '🙋‍♂️ សិស្សគណនាចម្ងាយសរុប 4 m ល្បឿនមធ្យម 0.5 m/s បម្លាស់ទី 0 m និងវ៉ិចទ័រល្បឿនមធ្យម 0 m/s។',
        evaluation: 'Exit pair-check៖ បែងចែកចម្ងាយពីបម្លាស់ទីបានត្រឹមត្រូវ',
      },
      {
        stepIndex: 5,
        stepNameKm: '៥. វាយតម្លៃ (EVALUATION)',
        timeMins: 5,
        teacherActivity: '🗣️ “សូមបំពេញសំណួរ 5 ដោយបង្ហាញរូបមន្ត ឯកតា និងទិសដៅនៅកន្លែងដែលចាំបាច់।”',
        studentActivity: '🙋‍♂️ សិស្សបំពេញសន្លឹកកិច្ចការម្នាក់ៗ និងសម្គាល់ចំណុចដែលខ្លួនមិនទាន់យល់។',
        evaluation: 'ពិន្ទុ 5; គ្រូបង្រៀនបន្ថែមបើសិស្សមិនទាន់បាន 3/5',
      },
    ];

    fullWorksheet = {
      title: 'សន្លឹកកិច្ចការ ៥ សំណួរ៖ ល្បឿន និងវ៉ិចទ័រល្បឿន',
      instructions: 'ឈ្មោះសិស្ស៖ ........................ ថ្នាក់ទី៖ 8 — សូមបង្ហាញរូបមន្ត និងឯកតា។',
      sections: [
        {
          sectionTitle: 'ផ្នែកទី ១៖ គំនិតគ្រឹះ',
          questions: [
            { id: 1, question: 'តើមួយណាជាបរិមាណវ៉ិចទ័រ?', options: ['ក. 5 m', 'ខ. 5 s', 'គ. 5 m/s ទៅទិសកើត', 'ឃ. 5 kg'], correctAnswer: 'គ. 5 m/s ទៅទិសកើត', explanation: 'វ៉ិចទ័រត្រូវមានទំហំ និងទិសដៅ។' },
            { id: 2, question: 'កង់ធ្វើដំណើរ 120 m ក្នុង 30 s។ ចូរគណនាល្បឿនមធ្យម។', correctAnswer: 'v = d/t = 120/30 = 4 m/s', explanation: 'ចែកចម្ងាយសរុបដោយពេលវេលាសរុប។' },
          ],
        },
        {
          sectionTitle: 'ផ្នែកទី ២៖ អនុវត្ត និងបកស្រាយ',
          questions: [
            { id: 3, question: 'បម្លែង 10 m/s ទៅជា km/h។', correctAnswer: '10 × 3.6 = 36 km/h', explanation: '1 m/s = 3.6 km/h។' },
            { id: 4, question: 'សិស្សដើរ 20 m ទៅកើត រួច 20 m ត្រឡប់មកទីតាំងដើម។ តើចម្ងាយ និងបម្លាស់ទីស្មើប៉ុន្មាន?', correctAnswer: 'ចម្ងាយ = 40 m; បម្លាស់ទី = 0 m', explanation: 'បម្លាស់ទីវាស់ពីទីតាំងដើមទៅទីតាំងចុងក្រោយ។' },
            { id: 5, question: 'រថយន្ត A និង B ទាំងពីរមាន 15 m/s ប៉ុន្តែ A ទៅជើង និង B ទៅត្បូង។ តើល្បឿន និងវ៉ិចទ័រល្បឿនរបស់វាដូចគ្នាឬទេ?', correctAnswer: 'ល្បឿនដូចគ្នា 15 m/s ប៉ុន្តែវ៉ិចទ័រល្បឿនខុសគ្នា ព្រោះទិសដៅផ្ទុយគ្នា។', explanation: 'ល្បឿនជាស្កាលែ; វ៉ិចទ័រល្បឿនមានទិសដៅ។' },
          ],
        },
      ],
    };
  } else {
    // Dynamic Fallback for ANY other topic
    objectives = {
      knowledge: `សិស្សអាចរៀបរាប់ ពន្យល់ និង វិភាគពីខ្លឹមសារគ្រឹះនៃ ${contentTarget} តាមរយៈសកម្មភាព ${methodObj.nameKm} បានយ៉ាងច្បាស់លាស់។`,
      skills: `សិស្សអភិវឌ្ឍបំណិនដំណើរការវិទ្យាសាស្ត្រ (${processSkillsKm}) តាមរយៈសកម្មភាពអនុវត្តផ្ទាល់ និង ការដោះស្រាយបញ្ហាជាក់ស្តែង។`,
      attitude: `បណ្ដុះស្មារតីសិស្សឱ្យមានគំនិតច្នៃប្រឌិត ចង់ដឹងចង់ឃើញ និង មានទំនួលខុសត្រូវក្នុងការរៀនសូត្រ។`,
    };

    blackboardSummary = `មេរៀន៖ ${sessionTitle}\nវិសាលភាពសម័យ៖ ${contentTarget}\n១. និយមន័យគ្រឹះ៖ ការសិក្សា និងការយល់ដឹងពីខ្លឹមសារដែលបានជ្រើស។\n២. ចំណុចគន្លឹះ៖\n   - ការស្វែងយល់ពីទំនាក់ទំនងរវាងកត្តាផ្សេងៗ និងការអនុវត្តផ្ទាល់។\n   - ការភ្ជាប់ខ្លឹមសារដែលបានជ្រើសទៅនឹងការដោះស្រាយបញ្ហាក្នុងសហគមន៍កម្ពុជា។`;

    misconceptionsAlert = {
      title: `⚠️ ការយល់ច្រឡំប្រចាំមេរៀន និងវិធីកែសម្រួលគំនិត`,
      commonMisconception: `សិស្សតែងតែយល់ច្រឡំថា ${contentTarget} មានន័យតែក្នុងសៀវភៅពុម្ព និងមិនមានទំនាក់ទំនងជាមួយជីវភាពរស់នៅ។`,
      diagnosticQuestion: `❓ "តើ ${contentTarget} មានប្រយោជន៍អ្វីខ្លះក្នុងជីវភាពរស់នៅប្រចាំថ្ងៃ?"`,
      teacherIntervention: `💡 គ្រូបង្ហាញរូបភាព/វត្ថុជាក់ស្តែងដើម្បីឱ្យសិស្សបានឃើញទំនាក់ទំនងផ្ទាល់។`,
    };

    handsOnActivity = {
      title: `សកម្មភាពអនុវត្តផ្ទាល់ដៃ៖ ${sessionTitle}`,
      materialsNeeded: ['សៀវភៅពុម្ព', 'សម្ភារកែច្នៃក្នុងស្រុក', 'សន្លឹកកិច្ចការសង្កេតក្រុម'],
      steps: [
        `១. ចែកសិស្សជា ៤ ក្រុម និងណែនាំកិច្ចការស្វែងយល់ស្ដីពី ${contentTarget}។`,
        '២. សិស្សធ្វើការពិភាក្សា និង អនុវត្តកិច្ចការតាមសន្លឹកណែនាំ។',
        '៣. កត់ត្រាទិន្នន័យ និង រៀបចំរាយការណ៍ជូនថ្នាក់។',
      ],
      thinkingPrompts: [`• "តើប្អូនៗអាចអនុវត្ត ${contentTarget} ក្នុងជីវភាពរស់នៅយ៉ាងដូចម្តេច?"`],
    };

    processMatrix = [
      {
        stepIndex: 1,
        stepNameKm: '១. ចូលរួម (ENGAGE)',
        timeMins: 5,
        teacherActivity: `🗣️ **ពាក្យសម្តីគ្រូនិយាយផ្ទាល់៖**\n"សួស្តីប្អូនៗ! តើប្អូនៗធ្លាប់បានដឹង ឬជួបប្រទះ ${contentTarget} ដែរឬទេ?"`,
        studentActivity: `🙋‍♂️ **ចម្លើយសិស្សរំពឹងទុក៖**\n"សិស្សឆ្លើយ និង បង្ហាញការចាប់អារម្មណ៍ចង់ដឹងពីមេរៀនថ្មី!"`,
        evaluation: 'សង្កេតការចាប់អារម្មណ៍',
      },
      {
        stepIndex: 2,
        stepNameKm: '២. ស្វែងយល់ (EXPLORE)',
        timeMins: 15,
        teacherActivity: `🗣️ **ពាក្យសម្តីគ្រូណែនាំ៖**\n"សូមប្អូនៗធ្វើការជាក្រុមស្វែងយល់ពី ${contentTarget} តាមសន្លឹកកិច្ចការ!"`,
        studentActivity: `🙋‍♂️ **សកម្មភាពសិស្ស៖**\n• សិស្សធ្វើការជាក្រុម កត់ត្រាទិន្នន័យ និង ពិភាក្សា។`,
        evaluation: 'វាយតម្លៃបំណិនក្រុម',
      },
      {
        stepIndex: 3,
        stepNameKm: '៣. ពន្យល់ (EXPLAIN)',
        timeMins: 10,
        teacherActivity: `🗣️ **ពាក្យសម្តីគ្រូ៖**\n"សូមតំណាងក្រុមឡើងរាយការណ៍! គ្រូសរសេរខ្លឹមសារសំខាន់លើក្តារខៀន។"`,
        studentActivity: `🙋‍♂️ **សិស្ស៖** តំណាងក្រុមរាយការណ៍ និង កត់ត្រាក្តារខៀន។`,
        evaluation: 'វាយតម្លៃការយល់ដឹង',
      },
      {
        stepIndex: 4,
        stepNameKm: '៤. ពង្រីក (ELABORATE)',
        timeMins: 10,
        teacherActivity: `🗣️ **ពាក្យសម្តីគ្រូ៖** "ដាក់សំណួរពង្រីកចំណេះដឹងទាក់ទងនឹង ${contentTarget}!"`,
        studentActivity: `🙋‍♂️ **សិស្ស៖** ពិភាក្សាដោះស្រាយសំណួរពង្រីក។`,
        evaluation: 'ត្រួតពិនិត្យ',
      },
      {
        stepIndex: 5,
        stepNameKm: '៥. វាយតម្លៃ (EVALUATION)',
        timeMins: 5,
        teacherActivity: `🗣️ **ពាក្យសម្តីគ្រូ៖** "ឱ្យសិស្សបំពេញសន្លឹកកិច្ចការ ៥ សំណួរ!"`,
        studentActivity: `🙋‍♂️ **សិស្ស៖** បំពេញសន្លឹកកិច្ចការម្នាក់ៗ។`,
        evaluation: 'វាយតម្លៃ',
      },
    ];

    fullWorksheet = {
      title: `សន្លឹកកិច្ចការសិស្ស ៥ សំណួរ៖ ${sessionTitle}`,
      instructions: 'ឈ្មោះសិស្ស៖ ............................................. ថ្នាក់ទី៖ .........',
      sections: [
        {
          sectionTitle: 'ផ្នែកទី ១៖ សំណួរជ្រើសរើសចម្លើយត្រឹមត្រូវ',
          questions: [
            {
              id: 1,
              question: `តើចំណុចសំខាន់នៃ ${contentTarget} គឺអ្វី?`,
              options: ['ក. ទ្រឹស្តី និង ការអនុវត្ត', 'ខ. គ្មានប្រយោជន៍', 'គ. មិនច្បាស់លាស់', 'ឃ. ផ្សេងៗ'],
              correctAnswer: 'ក. ទ្រឹស្តី និង ការអនុវត្ត',
              explanation: `ការយល់ដឹងពី ${contentTarget} ជួយដោះស្រាយបញ្ហាក្នុងជីវភាព។`,
            },
            {
              id: 2,
              question: `តើបំណិនដំណើរការវិទ្យាសាស្ត្រមួយណាដែលត្រូវប្រើប្រាស់ក្នុងមេរៀននេះ?`,
              options: ['ក. ការសង្កេត', 'ខ. ការទាយទុក', 'គ. ការបកស្រាយទិន្នន័យ', 'ឃ. ទាំងអស់ខាងលើ'],
              correctAnswer: 'ឃ. ទាំងអស់ខាងលើ',
              explanation: 'បំណិនវិទ្យាសាស្ត្រជួយឱ្យការរៀនសូត្រមានប្រសិទ្ធភាព។',
            },
          ],
        },
        {
          sectionTitle: 'ផ្នែកទី ២៖ សំណួរបំពេញចន្លោះ',
          questions: [
            {
              id: 3,
              question: `${contentTarget} មានសារៈសំខាន់ក្នុងការស្វែងយល់ពី .....................................។`,
              correctAnswer: 'បាតុភូតធម្មជាតិ និង ជីវិតរស់នៅ',
              explanation: 'ការភ្ជាប់មេរៀនទៅនឹងជីវិតពិត។',
            },
            {
              id: 4,
              question: `ការធ្វើពិសោធន៍ និង ការអនុវត្តផ្ទាល់ជួយពង្រឹងបំណិន ..................................... របស់សិស្ស។`,
              correctAnswer: 'ដំណើរការវិទ្យាសាស្ត្រ',
              explanation: 'បំណិនដៃ និង ការគិតវិភាគ។',
            },
          ],
        },
        {
          sectionTitle: 'ផ្នែកទី ៣៖ សំណួរត្រិះរិះ',
          questions: [
            {
              id: 5,
              question: `ចូរបកស្រាយពីការអនុវត្ត ${contentTarget} ក្នុងសហគមន៍បច្ចុប្បន្ន?`,
              correctAnswer: `ការតភ្ជាប់ខ្លឹមសារ ${contentTarget} ទៅនឹងការដោះស្រាយបញ្ហាក្នុងសហគមន៍កម្ពុជា។`,
              explanation: 'ស្ទង់មើលការគិតកម្រិតខ្ពស់របស់សិស្ស។',
            },
          ],
        },
      ],
    };
  }

  processMatrix = processMatrix.map((step, index) => ({
    ...step,
    timeMins: phaseTimes[index] ?? step.timeMins,
  }));

  return finalizeLessonPlan({
    metadata: {
      id: 'LP-LOCAL-' + Date.now().toString().slice(-6),
      generatedAt: new Date().toISOString(),
      schoolName,
      teacherName,
      grade: `ថ្នាក់ទី ${gradeLevel}`,
      subjectKm: subjectNameKm,
      subjectEn: subjectNameEn,
      ...sessionMetadata,
      duration: `${durationMins} នាទី (Minutes)`,
      durationMins,
      date: dateStr,
      resourceLevel,
      teachingMethodKm: methodObj.nameKm,
      teachingMethodEn: methodObj.nameEn,
      teachingMethodId: teachingMethod,
      processSkillsKm,
      includeSlides,
      isRealAiGenerated: false,
      aiProvider: 'offline',
      aiProviderRequested: aiProvider,
      contentProfile: isProtist || isPhotosynthesis || isSpeedVelocity ? 'topic-specific' : 'generic-draft',
      apiError:
        aiProvider === 'offline'
          ? null
          : lastApiError ||
            (aiProvider === 'openai'
              ? 'OpenAI is unavailable. Fallback to Local Smart Engine.'
              : aiProvider === 'anthropic'
                ? 'Anthropic is unavailable. Fallback to Local Smart Engine.'
                : activeKey
                  ? 'Gemini API failed to respond. Fallback to Local Smart Engine.'
                  : null),
    },
    objectives,
    blackboardSummary,
    misconceptionsAlert,
    differentiatedInstruction: {
      title: `🪜 ការបង្រៀនតាមកម្រិតសមត្ថភាពសិស្ស (Differentiated Instruction)`,
      fastLearners: `🚀 **សិស្សរៀនលឿន/ពូកែ (Advanced):** ផ្តល់សំណួរវិភាគកម្រិតខ្ពស់ទាក់ទងនឹង ${contentTarget} និងចាត់តាំងជាប្រធានក្រុម។`,
      strugglingLearners: `🪜 **សិស្សរៀនយឺត (Struggling):** ផ្តល់កាតរូបភាពជំនួយ ផ្គូផ្គងជាមួយសិស្សរៀនលឿន (Peer Buddy) និង ជួយកត់ត្រាទិន្នន័យ។`,
      specialNeeds: `♿ **ការអប់រំបរិយាបន្ន:** រៀបចំឱ្យសិស្សអង្គុយជួរមុខ និង ផ្តល់សម្ភារទំហំធំងាយមើល។`,
    },
    assessmentRubric: {
      title: `📊 រ៉ូប៊្រីកវាយតម្លៃកម្រិតសមត្ថភាពសិស្ស`,
      levels: [
        { levelKm: 'កម្រិត ៤ - ល្អប្រសើរ (90-100%)', criteria: `យល់ដឹងជៅជ្រះពី ${contentTarget}, ធ្វើសកម្មភាពពិសោធន៍ និងបកស្រាយទិន្នន័យបានឥតខ្ចោះ។`, badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
        { levelKm: 'កម្រិត ៣ - ល្អ (75-89%)', criteria: `យល់ខ្លឹមសារគ្រឹះ, ចូលរួមសកម្មភាពក្រុម និង ឆ្លើយសំណួរបានត្រឹមត្រូវភាគច្រើន។`, badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
        { levelKm: 'កម្រិត ២ - មធ្យម (60-74%)', criteria: `យល់ខ្លឹមសារខ្លះៗ, ត្រូវការជំនួយពីគ្រូ ឬ មិត្តភក្តិក្នុងការកត់ត្រាទិន្នន័យ។`, badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
        { levelKm: 'កម្រិត ១ - ត្រូវកែលម្អ (<60%)', criteria: `មិនទាន់យល់ដឹង និង ត្រូវការការបង្រៀនផ្ទាល់បន្ថែម (Remediation)។`, badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
      ],
    },
    handsOnActivity,
    teachingAids: [
      `សៀវភៅពុម្ពក្រសួងអប់រំ យុវជន និងកីឡា (${subjectNameKm} ថ្នាក់ទី ${gradeLevel})`,
      'រូបភាពតំណាង និង សម្ភារពិសោធន៍/កែច្នៃសាមញ្ញ',
      'ក្រដាសផ្ទាំងធំ (Flipchart) និង សន្លឹកកិច្ចការសង្កេតក្រុម',
    ],
    fiveStepsProcess: processMatrix,
    fullWorksheet,
  }, {
    anchor: curriculumAnchor,
    sources: selectedEnrichmentSources,
    sourceUsage: 'recommended-enrichment',
  });
}
