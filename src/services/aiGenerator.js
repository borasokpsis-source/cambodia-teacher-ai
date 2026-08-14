// Ultra-Detailed Scripted AI Lesson Plan Generator for Cambodian MoEYS Teachers
import { SCIENCE_PROCESS_SKILLS, TEACHING_METHODS } from '../data/moeysCurriculum';

export async function generateMoEYSLessonPlan({
  schoolName = 'សាលារៀន ហ៊ុន សែន',
  teacherName = 'គ្រូបង្រៀន អ៊ុក សុផល',
  gradeLevel = 10,
  subjectId = 'biology',
  subjectNameKm = 'ជីវវិទ្យា',
  subjectNameEn = 'Biology',
  topic = 'ជំពូកទី ១៖ ភាពចម្រុះនៃជីវិត - មេរៀនទី ៣៖ ប្រូទីស',
  durationMins = 90,
  resourceLevel = 'medium',
  teachingMethod = '5e_model',
  selectedSkills = ['observing', 'experimenting', 'interpreting'],
  apiKey = '',
}) {
  // Check if API key is provided directly, stored in localStorage, or configured in environment
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const activeKey = apiKey || localStorage.getItem('kruai_gemini_key') || envKey || '';

  const dateStr = new Date().toLocaleDateString('km-KH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const methodObj = TEACHING_METHODS.find((m) => m.id === teachingMethod) || TEACHING_METHODS[1];
  const processSkillsList = SCIENCE_PROCESS_SKILLS.filter((s) => selectedSkills.includes(s.id));
  const processSkillsKm = processSkillsList.map((s) => s.nameKm).join(', ') || 'ការសង្កេត, ការពិសោធន៍/អនុវត្តផ្ទាល់, ការបកស្រាយទិន្នន័យ';

  // -------------------------------------------------------------
  // REAL GEMINI API CALL (If API Key exists)
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

  if (activeKey && activeKey.trim().length > 10) {
    try {
      const prompt = `
You are an expert master teacher and curriculum writer for the Ministry of Education, Youth and Sport (MoEYS) in Cambodia.
Generate an ultra-detailed, scripted, 100% Khmer Unicode lesson plan in JSON format for a real Cambodian classroom.

Lesson Context:
- School: ${schoolName}
- Teacher: ${teacherName}
- Grade: Grade ${gradeLevel} (ថ្នាក់ទី ${gradeLevel})
- Subject: ${subjectNameKm} (${subjectNameEn})
- Topic: ${topic}
- Duration: ${durationMins} minutes
- Teaching Framework: ${methodObj.nameKm} (${methodObj.nameEn})
- Target Science Process Skills: ${processSkillsKm}

CRITICAL INSTRUCTIONS FOR TOPIC ACCURACY & QUALITY:
1. The target lesson topic is EXACTLY: "${topic}".
2. Every single section of the lesson plan (Objectives, Blackboard Notes, Misconceptions Alert, Differentiated Instruction, Assessment Rubric, Hands-On Activity/Experiment, Teaching Aids, 5E Teacher Dialogue & Student Responses, and complete 5-question Worksheet with Answer Key) MUST BE 100% ACCURATE AND SPECIFIC TO THE TOPIC "${topic}".
3. DO NOT output content for any unrelated topic. For example, if the topic is "${topic}", do NOT write about Photosynthesis or Levers unless the topic itself explicitly asks for Photosynthesis or Levers.
4. Provide realistic Khmer teacher dialogue scripts ("🗣️ **ពាក្យសម្តីគ្រូនិយាយផ្ទាល់៖**..."), expected student responses ("🙋‍♂️ **ចម្លើយសិស្សរំពឹងទុក៖**..."), and curriculum-aligned Khmer terminology.

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
    "title": "សកម្មភាពអនុវត្តផ្ទាល់ដៃ: ${topic}",
    "materialsNeeded": ["...", "..."],
    "steps": ["...", "..."],
    "thinkingPrompts": ["...", "..."]
  },
  "teachingAids": ["...", "..."],
  "fiveStepsProcess": [
    {
      "stepIndex": 1,
      "stepNameKm": "១. ចូលរួម (ENGAGE)",
      "timeMins": 5,
      "teacherActivity": "🗣️ **ពាក្យសម្តីគ្រូនិយាយផ្ទាល់៖**\\n...",
      "studentActivity": "🙋‍♂️ **ចម្លើយសិស្សរំពឹងទុក៖**\\n...",
      "evaluation": "..."
    },
    {
      "stepIndex": 2,
      "stepNameKm": "២. ស្វែងយល់ (EXPLORE)",
      "timeMins": 15,
      "teacherActivity": "...",
      "studentActivity": "...",
      "evaluation": "..."
    },
    {
      "stepIndex": 3,
      "stepNameKm": "៣. ពន្យល់ (EXPLAIN)",
      "timeMins": 10,
      "teacherActivity": "...",
      "studentActivity": "...",
      "evaluation": "..."
    },
    {
      "stepIndex": 4,
      "stepNameKm": "៤. ពង្រីក (ELABORATE)",
      "timeMins": 10,
      "teacherActivity": "...",
      "studentActivity": "...",
      "evaluation": "..."
    },
    {
      "stepIndex": 5,
      "stepNameKm": "៥. វាយតម្លៃ (EVALUATION)",
      "timeMins": 5,
      "teacherActivity": "...",
      "studentActivity": "...",
      "evaluation": "..."
    }
  ],
  "fullWorksheet": {
    "title": "សន្លឹកកិច្ចការសិស្ស ៥ សំណួរពេញលេញ: ${topic}",
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
        return {
          metadata: {
            id: 'LP-AI-' + Date.now().toString().slice(-6),
            generatedAt: new Date().toISOString(),
            schoolName,
            teacherName,
            grade: `ថ្នាក់ទី ${gradeLevel}`,
            subjectKm: subjectNameKm,
            subjectEn: subjectNameEn,
            topic,
            duration: `${durationMins} នាទី (Minutes)`,
            date: dateStr,
            resourceLevel,
            teachingMethodKm: methodObj.nameKm,
            teachingMethodEn: methodObj.nameEn,
            processSkillsKm,
            isRealAiGenerated: true,
            aiModelUsed: usedModel,
          },
          objectives: responseJson.objectives,
          blackboardSummary: responseJson.blackboardSummary || `មេរៀន៖ ${topic}`,
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
        };
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

  const topicLower = topic.toLowerCase();
  const isProtist = topicLower.includes('ប្រូទីស') || topicLower.includes('protist');
  const isBacteriaVirus = topicLower.includes('បាក់តេរី') || topicLower.includes('វីរុស') || topicLower.includes('bacteria');
  const isPhotosynthesis = topicLower.includes('រស្មីសំយោគ') || topicLower.includes('photosynthesis');
  const isSimpleMachines = topicLower.includes('ម៉ាស៊ីនងាយ') || topicLower.includes('ឃ្នាស់') || topicLower.includes('lever');

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
  } else {
    // Dynamic Fallback for ANY other topic
    objectives = {
      knowledge: `សិស្សអាចរៀបរាប់ ពន្យល់ និង វិភាគពីខ្លឹមសារគ្រឹះនៃ ${topic} តាមរយៈសកម្មភាព ${methodObj.nameKm} បានយ៉ាងច្បាស់លាស់។`,
      skills: `សិស្សអភិវឌ្ឍបំណិនដំណើរការវិទ្យាសាស្ត្រ (${processSkillsKm}) តាមរយៈសកម្មភាពអនុវត្តផ្ទាល់ និង ការដោះស្រាយបញ្ហាជាក់ស្តែង។`,
      attitude: `បណ្ដុះស្មារតីសិស្សឱ្យមានគំនិតច្នៃប្រឌិត ចង់ដឹងចង់ឃើញ និង មានទំនួលខុសត្រូវក្នុងការរៀនសូត្រ។`,
    };

    blackboardSummary = `មេរៀន៖ ${topic}\n១. និយមន័យគ្រឹះ៖ ការសិក្សា និង ការយល់ដឹងពីទ្រឹស្តីសំខាន់ៗនៃ ${topic}។\n២. ចំណុចគន្លឹះ៖\n   - ការស្វែងយល់ពីទំនាក់ទំនងរវាងកត្តាផ្សេងៗ និង ការអនុវត្តផ្ទាល់។\n   - ការភ្ជាប់ទ្រឹស្តីទៅនឹងការដោះស្រាយបញ្ហាក្នុងសហគមន៍កម្ពុជា។`;

    misconceptionsAlert = {
      title: `⚠️ ការយល់ច្រឡំប្រចាំមេរៀន និងវិធីកែសម្រួលគំនិត`,
      commonMisconception: `សិស្សតែងតែយល់ច្រឡំថា ${topic} មានន័យតែក្នុងសៀវភៅពុម្ព និង មិនមានទំនាក់ទំនងជាមួយជីវភាពរស់នៅ។`,
      diagnosticQuestion: `❓ "តើ ${topic} មានប្រយោជន៍អ្វីខ្លះក្នុងជីវភាពរស់នៅប្រចាំថ្ងៃ?"`,
      teacherIntervention: `💡 គ្រូបង្ហាញរូបភាព/វត្ថុជាក់ស្តែងដើម្បីឱ្យសិស្សបានឃើញទំនាក់ទំនងផ្ទាល់។`,
    };

    handsOnActivity = {
      title: `សកម្មភាពអនុវត្តផ្ទាល់ដៃ៖ ${topic}`,
      materialsNeeded: ['សៀវភៅពុម្ព', 'សម្ភារកែច្នៃក្នុងស្រុក', 'សន្លឹកកិច្ចការសង្កេតក្រុម'],
      steps: [
        `១. ចែកសិស្សជា ៤ ក្រុម និង ណែនាំកិច្ចការស្វែងយល់ស្ដីពី ${topic}។`,
        '២. សិស្សធ្វើការពិភាក្សា និង អនុវត្តកិច្ចការតាមសន្លឹកណែនាំ។',
        '៣. កត់ត្រាទិន្នន័យ និង រៀបចំរាយការណ៍ជូនថ្នាក់។',
      ],
      thinkingPrompts: [`• "តើប្អូនៗអាចអនុវត្ត ${topic} ក្នុងជីវភាពរស់នៅយ៉ាងដូចម្តេច?"`],
    };

    processMatrix = [
      {
        stepIndex: 1,
        stepNameKm: '១. ចូលរួម (ENGAGE)',
        timeMins: 5,
        teacherActivity: `🗣️ **ពាក្យសម្តីគ្រូនិយាយផ្ទាល់៖**\n"សួស្តីប្អូនៗ! តើប្អូនៗធ្លាប់បានដឹង ឬ ជួបប្រទះ ${topic} ដែរឬទេ?"`,
        studentActivity: `🙋‍♂️ **ចម្លើយសិស្សរំពឹងទុក៖**\n"សិស្សឆ្លើយ និង បង្ហាញការចាប់អារម្មណ៍ចង់ដឹងពីមេរៀនថ្មី!"`,
        evaluation: 'សង្កេតការចាប់អារម្មណ៍',
      },
      {
        stepIndex: 2,
        stepNameKm: '២. ស្វែងយល់ (EXPLORE)',
        timeMins: 15,
        teacherActivity: `🗣️ **ពាក្យសម្តីគ្រូណែនាំ៖**\n"សូមប្អូនៗធ្វើការជាក្រុមស្វែងយល់ពី ${topic} តាមសន្លឹកកិច្ចការ!"`,
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
        teacherActivity: `🗣️ **ពាក្យសម្តីគ្រូ៖** "ដាក់សំណួរពង្រីកចំណេះដឹងទាក់ទងនឹង ${topic}!"`,
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
      title: `សន្លឹកកិច្ចការសិស្ស ៥ សំណួរ៖ ${topic}`,
      instructions: 'ឈ្មោះសិស្ស៖ ............................................. ថ្នាក់ទី៖ .........',
      sections: [
        {
          sectionTitle: 'ផ្នែកទី ១៖ សំណួរជ្រើសរើសចម្លើយត្រឹមត្រូវ',
          questions: [
            {
              id: 1,
              question: `តើចំណុចសំខាន់នៃ ${topic} គឺអ្វី?`,
              options: ['ក. ទ្រឹស្តី និង ការអនុវត្ត', 'ខ. គ្មានប្រយោជន៍', 'គ. មិនច្បាស់លាស់', 'ឃ. ផ្សេងៗ'],
              correctAnswer: 'ក. ទ្រឹស្តី និង ការអនុវត្ត',
              explanation: `ការយល់ដឹងពី ${topic} ជួយដោះស្រាយបញ្ហាក្នុងជីវភាព។`,
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
              question: `${topic} មានសារៈសំខាន់ក្នុងការស្វែងយល់ពី .....................................។`,
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
              question: `ចូរបកស្រាយពីការអនុវត្ត ${topic} ក្នុងសហគមន៍បច្ចុប្បន្ន?`,
              correctAnswer: `ការតភ្ជាប់ទ្រឹស្តីមេរៀន ${topic} ទៅនឹងការដោះស្រាយបញ្ហាក្នុងសហគមន៍កម្ពុជា។`,
              explanation: 'ស្ទង់មើលការគិតកម្រិតខ្ពស់របស់សិស្ស។',
            },
          ],
        },
      ],
    };
  }

  return {
    metadata: {
      id: 'LP-LOCAL-' + Date.now().toString().slice(-6),
      generatedAt: new Date().toISOString(),
      schoolName,
      teacherName,
      grade: `ថ្នាក់ទី ${gradeLevel}`,
      subjectKm: subjectNameKm,
      subjectEn: subjectNameEn,
      topic,
      duration: `${durationMins} នាទី (Minutes)`,
      date: dateStr,
      resourceLevel,
      teachingMethodKm: methodObj.nameKm,
      teachingMethodEn: methodObj.nameEn,
      processSkillsKm,
      isRealAiGenerated: false,
      apiError: activeKey ? (lastApiError || 'Gemini API failed to respond. Fallback to Local Smart Engine.') : null,
    },
    objectives,
    blackboardSummary,
    misconceptionsAlert,
    differentiatedInstruction: {
      title: `🪜 ការបង្រៀនតាមកម្រិតសមត្ថភាពសិស្ស (Differentiated Instruction)`,
      fastLearners: `🚀 **សិស្សរៀនលឿន/ពូកែ (Advanced):** ផ្តល់សំណួរវិភាគកម្រិតខ្ពស់ទាក់ទងនឹង ${topic} និង ចាត់តាំងជាប្រធានក្រុម។`,
      strugglingLearners: `🪜 **សិស្សរៀនយឺត (Struggling):** ផ្តល់កាតរូបភាពជំនួយ ផ្គូផ្គងជាមួយសិស្សរៀនលឿន (Peer Buddy) និង ជួយកត់ត្រាទិន្នន័យ។`,
      specialNeeds: `♿ **ការអប់រំបរិយាបន្ន:** រៀបចំឱ្យសិស្សអង្គុយជួរមុខ និង ផ្តល់សម្ភារទំហំធំងាយមើល។`,
    },
    assessmentRubric: {
      title: `📊 រ៉ូប៊្រីកវាយតម្លៃកម្រិតសមត្ថភាពសិស្ស`,
      levels: [
        { levelKm: 'កម្រិត ៤ - ល្អប្រសើរ (90-100%)', criteria: `យល់ដឹងជៅជ្រះពី ${topic}, ធ្វើសកម្មភាពពិសោធន៍ និង បកស្រាយទិន្នន័យបានឥតខ្ចោះ។`, badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
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
  };
}
