import { generateAnthropicJson } from './anthropicClient';
import { buildLessonPlanPrompt } from './openAILessonGenerator';

export async function generateAnthropicLessonContent(context) {
  const prompt = buildLessonPlanPrompt(context);
  const response = await generateAnthropicJson(prompt);
  return {
    model: response.model,
    responseId: response.responseId,
    usage: response.usage,
    stopReason: response.stopReason,
    rawText: response.outputText,
  };
}
