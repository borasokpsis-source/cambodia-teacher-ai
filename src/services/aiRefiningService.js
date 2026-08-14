// AI Live Refinement Service for KruAI
// Enables teachers to modify existing lesson plans dynamically (e.g., add games, simplify materials, add exam prep)

export async function refineLessonPlan(currentPlan, refinementPrompt) {
  // Simulate AI refining delay
  await new Promise((res) => setTimeout(res, 1000));

  const planCopy = JSON.parse(JSON.stringify(currentPlan));
  const promptLower = refinementPrompt.toLowerCase();

  // Refinement 1: Add a 5-minute Educational Game
  if (promptLower.includes('game') || promptLower.includes('ល្បែង') || promptLower.includes('ហ្គេម')) {
    planCopy.gameActivity = {
      title: `🎮 ល្បែងសិក្សា ៥ នាទី (5-Minute Educational Game): ស្វែងយល់ ${planCopy.metadata.topic}`,
      instructions: `• ចែកសិស្សជា ២ ក្រុមធំ (ក្រុម A និង ក្រុម B)។\n• គ្រូបង្ហាញប័ណ្ណពាក្យ/ប័ណ្ណរូបភាពទាក់ទងនឹង ${planCopy.metadata.topic} រួចឱ្យតំណាងក្រុមឡើងប្រកួតប្រជែងឆ្លើយ ឬ បង្ហាញកាយវិការក្នុងរយៈពេល ៣០ វិនាទី។\n• ក្រុមណាឆ្លើយត្រូវច្រើនជាងគេ និងទទួលបានប័ណ្ណសរសើរ!`,
    };
  }

  // Refinement 2: Add Exam Prep Questions (BacII / Grade 9 Exam)
  if (promptLower.includes('exam') || promptLower.includes('ប្រឡង') || promptLower.includes('បាក់ឌុប')) {
    planCopy.examPrepSection = {
      title: `📝 សំណួរត្រៀមប្រឡងថ្នាក់ជាតិ/បាក់ឌុប (National Exam Prep Questions)`,
      questions: [
        {
          q: `សំណួរប្រឡងគំរូ ១៖ ចូរបកស្រាយពីសារៈសំខាន់នៃ ${planCopy.metadata.topic} ក្នុងជីវភាពរស់នៅ?`,
          a: `ចម្លើយត្រូវតែមាន៖ ១. និយមន័យត្រឹមត្រូវ, ២. ឧទាហរណ៍ជាក់ស្តែងកម្ពុជា ២ យ៉ាង, ៣. ការអនុវត្ត។`,
        },
        {
          q: `សំណួរប្រឡងគំរូ ២ (វិភាគ)៖ ប្រសិនបើមានការប្រែប្រួលលក្ខខណ្ឌក្នុង ${planCopy.metadata.topic} តើនឹងមានផលប៉ះពាល់អ្វីខ្លះ?`,
          a: `វិភាគផលប៉ះពាល់វិជ្ជមាន និង អវិជ្ជមានតាមលំដាប់លំដោយ។`,
        },
      ],
    };
  }

  // Refinement 3: Low-Cost Recycled Materials Only
  if (promptLower.includes('recycled') || promptLower.includes('កែច្នៃ') || promptLower.includes('សម្ភារ')) {
    if (planCopy.handsOnActivity) {
      planCopy.handsOnActivity.materialsNeeded = [
        'ដបទឹកសុទ្ធប្លាស្ទិកចាស់ៗ (Recycled plastic bottles)',
        'កម្ទេចកាតុង និងក្រដាសកាសែតចាស់ៗ',
        'ចរណៃ/កៅស៊ូកាត់ និងឆើកេត ឬ ដើមឫស្សីក្នុងស្រុក',
        'ទឹកស្អាត និងពណ៌ធម្មជាតិ (ស្លឹកតយ/លៀត)',
      ];
    }
  }

  // Refinement 4: Bilingual Khmer-English
  if (promptLower.includes('bilingual') || promptLower.includes('អង់គ្លេស') || promptLower.includes('english')) {
    planCopy.metadata.isBilingual = true;
    planCopy.objectives.knowledge += ` (Students explain the concepts of ${planCopy.metadata.topic} in both Khmer and English.)`;
  }

  return planCopy;
}
