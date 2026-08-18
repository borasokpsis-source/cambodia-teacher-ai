import { generateOpenAIJson } from './openAIClient.js';

export function buildLessonPlanPrompt({
  schoolName,
  teacherName,
  gradeLevel,
  subjectNameKm,
  subjectNameEn,
  topic,
  selectedSubtitles = [],
  customSessionFocus = '',
  durationMins,
  resourceLevel,
  methodNameKm,
  methodNameEn,
  processSkillsKm,
  phaseTimes,
  curriculumAndSourceContext,
}) {
  const hasSessionScope = selectedSubtitles.length > 0 || customSessionFocus.trim();
  const selectedSubtitleText = selectedSubtitles.length
    ? selectedSubtitles.map((subtitle, index) => `${index + 1}. ${subtitle}`).join('\n')
    : 'None selected';
  const sessionTarget = [selectedSubtitles.join('; '), customSessionFocus.trim()]
    .filter(Boolean)
    .join('; ') || topic;

  return `Create a classroom-ready Cambodian lesson plan as one JSON object.

LESSON CONTEXT
- School: ${schoolName}
- Teacher: ${teacherName}
- Grade: ${gradeLevel}
- Subject: ${subjectNameKm} (${subjectNameEn})
- Parent textbook lesson (curriculum boundary): ${topic}
- Exact target for THIS teaching session: ${sessionTarget}
- Selected textbook subtitles:
${selectedSubtitleText}
- Teacher-entered session focus: ${customSessionFocus.trim() || 'None'}
- Duration: ${durationMins} minutes
- Classroom resource level: ${resourceLevel}
- Teaching method: ${methodNameKm} (${methodNameEn})
- Science process skills: ${processSkillsKm}
- Five phase timing: ${phaseTimes.join(' + ')} = ${durationMins} minutes

${curriculumAndSourceContext}

QUALITY REQUIREMENTS
1. Write natural Khmer Unicode suitable for a Cambodian teacher. English technical terms may appear in parentheses only where useful.
2. ${hasSessionScope
    ? 'Teach ONLY the selected subtitles and teacher-entered session focus. Do not teach, assess, or assign content from unselected subtitles. The parent lesson may be mentioned only as brief context.'
    : 'Teach the exact parent lesson, not the chapter title as a placeholder.'} Do not repeatedly paste the full lesson title into sentences.
3. Include at least five accurate, grade-appropriate topic concepts or facts and at least four topic-specific technical terms.
4. Each objective must identify observable student performance and a success criterion. Avoid combining vague verbs such as describe, explain and analyze without evidence.
5. The inquiry or hands-on activity must name concrete materials, numbered actions, observable evidence or data, safety guidance when relevant, and thinking questions. Provide a realistic alternative when specialist equipment is unavailable.
6. Every 5E phase must contain a specific teacher action, a specific student action, and a formative assessment connected to the lesson objective.
7. The worksheet must assess the stated objectives. Multiple-choice distractors must be plausible. Never use meaningless distractors such as "no benefit", "unclear", or "other".
8. Provide exactly five worksheet questions: two multiple choice, two short/fill responses, and one higher-order application question. Include a correct answer and brief explanation for every question.
9. Do not invent MoEYS page numbers, quotations, approval, or facts not supported by the supplied curriculum context.
10. Do not include Markdown symbols, code fences, emojis, or commentary inside field values.

Return this exact top-level structure:
{
  "objectives": {
    "knowledge": "...",
    "skills": "...",
    "attitude": "..."
  },
  "blackboardSummary": "...",
  "misconceptionsAlert": {
    "title": "...",
    "commonMisconception": "...",
    "diagnosticQuestion": "...",
    "teacherIntervention": "..."
  },
  "differentiatedInstruction": {
    "title": "...",
    "fastLearners": "...",
    "strugglingLearners": "...",
    "specialNeeds": "..."
  },
  "assessmentRubric": {
    "title": "...",
    "levels": [
      { "levelKm": "កម្រិត ៤ - ល្អប្រសើរ", "criteria": "..." },
      { "levelKm": "កម្រិត ៣ - ល្អ", "criteria": "..." },
      { "levelKm": "កម្រិត ២ - មធ្យម", "criteria": "..." },
      { "levelKm": "កម្រិត ១ - ត្រូវកែលម្អ", "criteria": "..." }
    ]
  },
  "handsOnActivity": {
    "title": "...",
    "materialsNeeded": ["..."],
    "steps": ["..."],
    "thinkingPrompts": ["..."]
  },
  "teachingAids": ["..."],
  "fiveStepsProcess": [
    {
      "stepIndex": 1,
      "stepNameKm": "១. ចូលរួម (ENGAGE)",
      "timeMins": ${phaseTimes[0]},
      "teacherActivity": "...",
      "studentActivity": "...",
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
    "title": "...",
    "instructions": "...",
    "sections": [
      {
        "sectionTitle": "ផ្នែកទី ១៖ សំណួរជ្រើសរើសចម្លើយត្រឹមត្រូវ",
        "questions": [
          { "id": 1, "question": "...", "options": ["ក. ...", "ខ. ...", "គ. ...", "ឃ. ..."], "correctAnswer": "...", "explanation": "..." },
          { "id": 2, "question": "...", "options": ["ក. ...", "ខ. ...", "គ. ...", "ឃ. ..."], "correctAnswer": "...", "explanation": "..." }
        ]
      },
      {
        "sectionTitle": "ផ្នែកទី ២៖ សំណួរឆ្លើយខ្លី និងបំពេញចន្លោះ",
        "questions": [
          { "id": 3, "question": "...", "correctAnswer": "...", "explanation": "..." },
          { "id": 4, "question": "...", "correctAnswer": "...", "explanation": "..." }
        ]
      },
      {
        "sectionTitle": "ផ្នែកទី ៣៖ សំណួរត្រិះរិះ និងអនុវត្ត",
        "questions": [
          { "id": 5, "question": "...", "correctAnswer": "...", "explanation": "..." }
        ]
      }
    ]
  }
}`;
}

export async function generateOpenAILessonContent(context) {
  const prompt = buildLessonPlanPrompt(context);
  const response = await generateOpenAIJson(prompt);
  return {
    model: response.model,
    responseId: response.responseId,
    usage: response.usage,
    rawText: response.outputText,
  };
}
