const text = { type: 'string' };

const objectiveSchema = {
  type: 'object',
  properties: {
    knowledge: text,
    skills: text,
    attitude: text,
  },
  required: ['knowledge', 'skills', 'attitude'],
  additionalProperties: false,
};

const worksheetQuestionSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    question: text,
    options: { type: 'array', items: text },
    correctAnswer: text,
    explanation: text,
  },
  required: ['id', 'question', 'correctAnswer', 'explanation'],
  additionalProperties: false,
};

export const lessonPlanSchema = {
  type: 'object',
  properties: {
    objectives: objectiveSchema,
    blackboardSummary: text,
    misconceptionsAlert: {
      type: 'object',
      properties: {
        title: text,
        commonMisconception: text,
        diagnosticQuestion: text,
        teacherIntervention: text,
      },
      required: ['title', 'commonMisconception', 'diagnosticQuestion', 'teacherIntervention'],
      additionalProperties: false,
    },
    differentiatedInstruction: {
      type: 'object',
      properties: {
        title: text,
        fastLearners: text,
        strugglingLearners: text,
        specialNeeds: text,
      },
      required: ['title', 'fastLearners', 'strugglingLearners', 'specialNeeds'],
      additionalProperties: false,
    },
    assessmentRubric: {
      type: 'object',
      properties: {
        title: text,
        levels: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              levelKm: text,
              criteria: text,
            },
            required: ['levelKm', 'criteria'],
            additionalProperties: false,
          },
        },
      },
      required: ['title', 'levels'],
      additionalProperties: false,
    },
    handsOnActivity: {
      type: 'object',
      properties: {
        title: text,
        materialsNeeded: { type: 'array', items: text },
        steps: { type: 'array', items: text },
        thinkingPrompts: { type: 'array', items: text },
      },
      required: ['title', 'materialsNeeded', 'steps', 'thinkingPrompts'],
      additionalProperties: false,
    },
    teachingAids: { type: 'array', items: text },
    fiveStepsProcess: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          stepIndex: { type: 'integer' },
          stepNameKm: text,
          timeMins: { type: 'integer' },
          teacherActivity: text,
          studentActivity: text,
          evaluation: text,
        },
        required: [
          'stepIndex',
          'stepNameKm',
          'timeMins',
          'teacherActivity',
          'studentActivity',
          'evaluation',
        ],
        additionalProperties: false,
      },
    },
    fullWorksheet: {
      type: 'object',
      properties: {
        title: text,
        instructions: text,
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sectionTitle: text,
              questions: { type: 'array', items: worksheetQuestionSchema },
            },
            required: ['sectionTitle', 'questions'],
            additionalProperties: false,
          },
        },
      },
      required: ['title', 'instructions', 'sections'],
      additionalProperties: false,
    },
  },
  required: [
    'objectives',
    'blackboardSummary',
    'misconceptionsAlert',
    'differentiatedInstruction',
    'assessmentRubric',
    'handsOnActivity',
    'teachingAids',
    'fiveStepsProcess',
    'fullWorksheet',
  ],
  additionalProperties: false,
};
