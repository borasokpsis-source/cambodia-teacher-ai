// MoEYS Cambodia Curriculum Data & Standard Templates
import { OFFICIAL_MOEYS_TEXTBOOKS } from './officialMoEYSTextbooks';

export { OFFICIAL_MOEYS_TEXTBOOKS };

export const EDUCATION_LEVELS = [
  {
    id: 'primary',
    nameKm: 'បឋមសិក្សា',
    nameEn: 'Primary School',
    grades: [1, 2, 3, 4, 5, 6],
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'lower_secondary',
    nameKm: 'អនុវិទ្យាល័យ',
    nameEn: 'Lower Secondary',
    grades: [7, 8, 9],
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  {
    id: 'upper_secondary',
    nameKm: 'វិទ្យាល័យ',
    nameEn: 'Upper Secondary',
    grades: [10, 11, 12],
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
];

export const SCIENCE_PROCESS_SKILLS = [
  { id: 'observing', nameKm: 'ការសង្កេត (Observing)', category: 'basic', desc: 'ប្រើប្រាស់វិញ្ញាណទាំង ៥ ដើម្បីប្រមូលទិន្នន័យ' },
  { id: 'classifying', nameKm: 'ការចាត់ថ្នាក់ (Classifying)', category: 'basic', desc: 'តម្រៀប ឬ បែងចែកក្រុមតាមលក្ខណៈសម្បត្តិ' },
  { id: 'measuring', nameKm: 'ការវាស់វែង (Measuring)', category: 'basic', desc: 'ប្រើប្រាស់ឧបករណ៍ដើម្បីវាស់វែងបរិមាណ' },
  { id: 'inferring', nameKm: 'ការទាញសន្និដ្ឋាន (Inferring)', category: 'basic', desc: 'ទាញសន្និដ្ឋានហេតុផលចេញពីទិន្នន័យ' },
  { id: 'predicting', nameKm: 'ការទាយទុក (Predicting)', category: 'basic', desc: 'ទាយលទ្ធផលទុកជាមុនតាមលំនាំសង្កេត' },
  { id: 'communicating', nameKm: 'ការទំនាក់ទំនង (Communicating)', category: 'basic', desc: 'ចែករំឡែកលទ្ធផលតាមតារាង ក្រាហ្វ ឬ ការបង្ហាញ' },
  { id: 'variables', nameKm: 'ការកំណត់អថេរ (Identifying Variables)', category: 'integrated', desc: 'កំណត់អថេរឯករាជ្យ អថេរអាស្រ័យ និងអថេរត្រួតពិនិត្យ' },
  { id: 'hypothesis', nameKm: 'ការបង្កើតសម្មតិកម្ម (Formulating Hypotheses)', category: 'integrated', desc: 'បង្កើតសម្មតិកម្មដែលអាចធ្វើការពិសោធន៍ផ្ទៀងផ្ទាត់បាន' },
  { id: 'experimenting', nameKm: 'ការពិសោធន៍/អនុវត្តផ្ទាល់ (Experimenting & Hands-On)', category: 'integrated', desc: 'រៀបចំ និងធ្វើការពិសោធន៍ផ្ទាល់ដៃ' },
  { id: 'interpreting', nameKm: 'ការបកស្រាយទិន្នន័យ (Interpreting Data)', category: 'integrated', desc: 'វិភាគ និងបកស្រាយទិន្នន័យពិសោធន៍' },
];

export const TEACHING_METHODS = [
  {
    id: 'moeys_standard',
    nameKm: 'វិធីសាស្ត្រ ៥ ជំហាន (MoEYS Standard)',
    nameEn: 'MoEYS Standard 5-Step Process',
    desc: 'រដ្ឋបាលថ្នាក់, ពិនិត្យមេរៀនចាស់, មេរៀនថ្មី, អនុវត្ត, វាយតម្លៃ',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  {
    id: '5e_model',
    nameKm: 'វិធីសាស្ត្រ 5E Inquiry Model',
    nameEn: '5E Model (Engage, Explore, Explain, Elaborate, Evaluate)',
    desc: 'ចូលរួម (Engage), ស្វែងយល់ (Explore), ពន្យល់ (Explain), ពង្រីក (Elaborate), វាយតម្លៃ (Evaluate)',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
  {
    id: 'inquiry_based',
    nameKm: 'វិធីសាស្ត្រ IBL (Inquiry-Based Learning)',
    nameEn: 'Inquiry-Based Learning (IBL)',
    desc: 'បង្កើតសំណួរចោទ, ស្រាវជ្រាវប្រមូលភស្តុតាង, វិភាគ និងឆ្លុះបញ្ចាំង',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'project_based',
    nameKm: 'វិធីសាស្ត្រ PBL (Project-Based Learning)',
    nameEn: 'Project-Based Learning (PBL)',
    desc: 'ដោះស្រាយបញ្ហាពិភពពិត, បង្កើតគម្រោងក្រុម, និងបកស្រាយផលិតផល',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  {
    id: 'stem_hands_on',
    nameKm: 'វិធីសាស្ត្រ STEM & Hands-On',
    nameEn: 'STEM & Hands-On Active Learning',
    desc: 'សកម្មភាពបង្កើតវត្ថុជាក់ស្តែង និងដំណោះស្រាយបច្ចេកវិទ្យា',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
];

export const SUBJECTS_BY_LEVEL = {
  primary: [
    { id: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', icon: 'BookOpen' },
    { id: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', icon: 'Calculator' },
    { id: 'science_social', nameKm: 'វិទ្យាសាស្ត្រ និងសិក្សាសង្គម', nameEn: 'Science & Social Studies', icon: 'Globe' },
    { id: 'art_pe', nameKm: 'សិល្បៈ និងអប់រំកាយ', nameEn: 'Art & Physical Education', icon: 'Palette' },
  ],
  lower_secondary: [
    { id: 'science', nameKm: 'វិទ្យាសាស្ត្រ (សៀវភៅពុម្ពផ្លូវការ)', nameEn: 'Science (MoEYS Textbook)', icon: 'FlaskConical', isOfficial: true },
    { id: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', icon: 'BookOpen' },
    { id: 'math', nameKm: 'គណិតវិទ្យា', nameEn: 'Mathematics', icon: 'Calculator' },
    { id: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', icon: 'Zap' },
    { id: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', icon: 'FlaskConical' },
    { id: 'biology', nameKm: 'ជីវវិទ្យា', nameEn: 'Biology', icon: 'Dna' },
    { id: 'earth_sci', nameKm: 'ផែនដីវិទ្យា', nameEn: 'Earth & Environmental Science', icon: 'Mountain' },
    { id: 'history', nameKm: 'ប្រវត្តិវិទ្យា', nameEn: 'History', icon: 'Landmark' },
    { id: 'geography', nameKm: 'ភូមិវិទ្យា', nameEn: 'Geography', icon: 'Compass' },
    { id: 'civics', nameKm: 'សីលធម៌-ពលរដ្ឋវិទ្យា', nameEn: 'Moral & Civics', icon: 'HeartHandshake' },
    { id: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English', icon: 'Languages' },
    { id: 'ict', nameKm: 'បច្ចេកវិទ្យាព័ត៌មាន (ICT)', nameEn: 'ICT', icon: 'Laptop' },
  ],
  upper_secondary: [
    { id: 'biology', nameKm: 'ជីវវិទ្យា (សៀវភៅពុម្ពផ្លូវការ)', nameEn: 'Biology (MoEYS Textbook)', icon: 'Dna', isOfficial: true },
    { id: 'khmer', nameKm: 'ភាសាខ្មែរ', nameEn: 'Khmer Literature', icon: 'BookOpen' },
    { id: 'math', nameKm: 'គណិតវិទ្យា (កម្រិតខ្ពស់)', nameEn: 'Advanced Mathematics', icon: 'Calculator' },
    { id: 'physics', nameKm: 'រូបវិទ្យា', nameEn: 'Physics', icon: 'Zap' },
    { id: 'chemistry', nameKm: 'គីមីវិទ្យា', nameEn: 'Chemistry', icon: 'FlaskConical' },
    { id: 'earth_sci', nameKm: 'ផែនដីវិទ្យា', nameEn: 'Earth & Environmental Science', icon: 'Mountain' },
    { id: 'history', nameKm: 'ប្រវត្តិវិទ្យា', nameEn: 'History', icon: 'Landmark' },
    { id: 'geography', nameKm: 'ភូមិវិទ្យា', nameEn: 'Geography', icon: 'Compass' },
    { id: 'civics', nameKm: 'សីលធម៌-ពលរដ្ឋវិទ្យា', nameEn: 'Moral & Civics', icon: 'HeartHandshake' },
    { id: 'english', nameKm: 'ភាសាអង់គ្លេស', nameEn: 'English', icon: 'Languages' },
  ],
};

export const SAMPLE_TOPICS_BY_SUBJECT = {
  biology: [
    'ជំពូកទី ១៖ កោសិកា (សមាសធាតុគីមី, រូបផ្គុំ និងនាទីកោសិកា - ថ្នាក់ទី១១)',
    'ជំពូកទី ៥៖ ព័ត៌មានសែនេទិច (ADN, ការសម្តែងនៃសែន, បច្ចេកវិទ្យាជីវៈ - ថ្នាក់ទី១២)',
    'ជំពូកទី ៣៖ មេតាបូលីស (រស្មីសំយោគ, ដកដង្ហើមកោសិកា - ថ្នាក់ទី១០)',
    'ជំពូកទី ៤៖ នាទីប្រូតេអ៊ីន (អាស៊ីតអាមីនេ, ប្រូតេអ៊ីន, អង់ស៊ីម - ថ្នាក់ទី១២)',
  ],
  science: [
    'ជំពូកទី ២៖ ម៉ាស៊ីនងាយ (ឃ្នាស់, ប្លង់ទ្រេត, រ៉ក - វិទ្យាសាស្ត្រ ថ្នាក់ទី៩)',
    'ជំពូកទី ៣៖ អគ្គិសនី (បន្ទុកអគ្គិសនី, ចរន្ត, រេស៊ីស្តង់ - វិទ្យាសាស្ត្រ ថ្នាក់ទី៧)',
    'ជំពូកទី ២៖ ល្បាយ និងវិធីញែកល្បាយ (វិទ្យាសាស្ត្រ ថ្នាក់ទី៨)',
    'ជំពូកទី ២៖ ចលនាក្នុងផែនដី (ផ្លាកតិចតូនិច, ភ្នំភ្លើង, រញ្ជួយដី - វិទ្យាសាស្ត្រ ថ្នាក់ទី៩)',
  ],
  khmer: [
    'ការអាន អត្ថបទកែច្នៃ និងស្វែងយល់ន័យពាក្យ (Reading & Vocabulary)',
    'វិយាករណ៍៖ សំយោគពាក្យ និងសំណង់ប្រយោគ (Grammar & Sentence Construction)',
    'សំណេរ៖ ការរៀបរាប់ពីទេសភាពធម្មជាតិខ្មែរ (Descriptive Essay)',
    'អក្សរសិល្ប៍៖ រឿងរាមកេរ្តិ៍ និងតម្លៃអប់រំ (Khmer Literature & Moral Value)',
  ],
  math: [
    'ប្រព័ន្ធចំនួន និងប្រមាណវិធីគ្រឹះ (Number System & Basic Arithmetic)',
    'សមីការ និងវិសមីការដឺក្រេទី១ មានមួយអញ្ញាត (First Degree Equations)',
    'ធរណីមាត្រ៖ ផ្ទៃក្រឡា និងមាឌត្រីកោណ/ស៊ីឡាំង (Geometry & Areas)',
    'អនុគមន៍ត្រីកោណមាត្រ និងដេរីវេ (Trigonometry & Calculus)',
  ],
  physics: [
    'ចលនាត្រង់ស្មើ និងចលនាស្ទុះស្មើ (Kinematics & Linear Motion)',
    'ច្បាប់ញូតុន និងកម្លាំងទាញកែច្នៃ (Newton’s Laws of Motion)',
    'អគ្គិសនី៖ ចរន្តជាប់ និងច្បាប់អូម (Electricity & Ohm’s Law)',
    'អុបទិក៖ កញ្ចក់ និងឡង់ទីកោង (Optics & Lens Refraction)',
  ],
  chemistry: [
    'អាតូម ធាតុគីមី និងតារាងខួប (Atoms & Periodic Table)',
    'ប្រតិកម្មអាស៊ីត-បាស និងតម្លៃ pH (Acid-Base Reactions & pH)',
    'គីមីសរីរាង្គ៖ អ៊ីដ្រូកាបូន និងអាល់កុល (Organic Chemistry & Hydrocarbons)',
    'គីមីវិភាគ៖ កំហាប់សូលុយស្យុង (Solution Concentration)',
  ],
  history: [
    'សម័យអង្គរ៖ ការកសាងប្រាសាទ និងភាពរុងរឿង (Angkor Era & Heritage)',
    'ប្រវត្តិសាស្ត្រកម្ពុជាទំនើប និងសន្តិភាព (Modern Cambodian History & Peace)',
    'បដិវត្តន៍ឧស្សាហកម្ម និងសង្គ្រាមលោក (Industrial Revolution & World Wars)',
  ],
  geography: [
    'លក្ខណៈភូមិសាស្ត្រកម្ពុជា និងទន្លេមេគង្គ (Cambodia Geography & Mekong River)',
    'ការប្រែប្រួលអាកាសធាតុ និងគ្រោះធម្មជាតិ (Climate Change & Disasters)',
    'ប្រជាសាស្ត្រ និងការអភិវឌ្ឍសេដ្ឋកិច្ច (Demographics & Economic Growth)',
  ],
  civics: [
    'សីលធម៌រស់នៅក្នុងគ្រួសារ និងសង្គម (Family & Social Ethics)',
    'សិទ្ធិមនុស្ស សិទ្ធិកុមារ និងច្បាប់ចរាចរណ៍ (Human Rights & Traffic Safety)',
    'វប្បធម៌សន្តិភាព និងការទទួលខុសត្រូវជាពលរដ្ឋ (Culture of Peace & Citizenship)',
  ],
  english: [
    'Present Perfect vs Past Simple in Daily Conversation',
    'Reading Comprehension: Environmental Protection in ASEAN',
    'Formal Writing: Application Letter & CV Basics',
  ],
  art_pe: [
    'សិល្បៈគំនូរខ្មែរ និងក្បាច់រចនាបុរាណ (Khmer Traditional Art Patterns)',
    'អប់រំកាយ៖ កីឡាបាល់ទះ/បាល់ទាត់ និងសុខភាពកាយសម្បទា (Physical Fitness & Sports)',
  ],
  science_social: [
    'រុក្ខជាតិ និងសត្វនៅក្នុងលំនៅឋានយើង (Plants & Animals in Our Community)',
    'ការថែរក្សាអនាម័យ និងសុខភាពផ្ទាល់ខ្លួន (Personal Hygiene & Health)',
  ],
};

export const RESOURCE_LEVELS = [
  { id: 'low', nameKm: 'សម្ភារសាមញ្ញ (ក្តារខៀន/សៀវភៅពុម្ព)', nameEn: 'Low Resource (Chalkboard & Textbooks)' },
  { id: 'medium', nameKm: 'សម្ភារមធ្យម (រូបភាពបិទ/កាតពាក្យ/ក្រុម)', nameEn: 'Medium Resource (Posters & Group Cards)' },
  { id: 'high', nameKm: 'សម្ភារទំនើប (កុំព្យូទ័រ/កញ្ចក់បញ្ចាំង/ICT)', nameEn: 'High Resource (Projector/ICT/Digital)' },
];
