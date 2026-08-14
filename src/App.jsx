import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CurriculumSelector from './components/CurriculumSelector';
import LessonPlanForm from './components/LessonPlanForm';
import LessonPlanViewer from './components/LessonPlanViewer';
import { generateMoEYSLessonPlan } from './services/aiGenerator';
import { EDUCATION_LEVELS, SUBJECTS_BY_LEVEL } from './data/moeysCurriculum';
import { Sparkles, BookOpen, Layers, Cpu, CheckCircle, ArrowLeft } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'view'
  const [selectedLevel, setSelectedLevel] = useState('lower_secondary');
  const [selectedGrade, setSelectedGrade] = useState(8);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS_BY_LEVEL.lower_secondary[0]); // Science official

  const [formData, setFormData] = useState({
    schoolName: 'សាលារៀន ហ៊ុន សែន',
    teacherName: 'គ្រូបង្រៀន អ៊ុក សុផល',
    topic: 'សមីការ និងវិសមីការដឺក្រេទី១',
    durationMins: 45,
    resourceLevel: 'medium',
    teachingMethod: '5e_model',
    selectedSkills: ['observing', 'experimenting', 'interpreting'],
  });

  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTopicSelect = (topicTitle) => {
    setFormData((prev) => ({ ...prev, topic: topicTitle }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const plan = await generateMoEYSLessonPlan({
        schoolName: formData.schoolName,
        teacherName: formData.teacherName,
        gradeLevel: selectedGrade,
        subjectId: selectedSubject?.id || 'math',
        subjectNameKm: selectedSubject?.nameKm || 'គណិតវិទ្យា',
        subjectNameEn: selectedSubject?.nameEn || 'Mathematics',
        topic: formData.topic,
        durationMins: formData.durationMins,
        resourceLevel: formData.resourceLevel,
        teachingMethod: formData.teachingMethod,
        selectedSkills: formData.selectedSkills,
      });

      setGeneratedPlan(plan);
      setActiveTab('view');
    } catch (err) {
      console.error('Error generating lesson plan:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Glow Decorations */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 z-10">
        {activeTab === 'generator' && (
          <div className="space-y-8">
            {/* Banner Header */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold font-khmer">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ស្តង់ដារ 5E Model • IBL • PBL • STEM & គរុកោសល្យ ៥ ជំហាន ក្រសួងអប់រំ</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-khmer text-slate-100 leading-snug">
                  ប្រព័ន្ធ AI បង្កើតកិច្ចតែងការបង្រៀន <span className="text-gradient">5E Inquiry & STEM</span> សម្រាប់គ្រូកម្ពុជា
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-khmer leading-relaxed">
                  បង្កើតកិច្ចតែងការតាម <strong className="text-cyan-400">វិធីសាស្ត្រ 5E, IBL, PBL និង STEM Hands-on</strong> ដោយបង្កប់ <strong className="text-amber-400">បំណិនដំណើរការវិទ្យាសាស្ត្រ (Science Process Skills)</strong> និងសៀវភៅពុម្ពផ្លូវការក្រសួងអប់រំ យុវជន និងកីឡា។
                </p>
              </div>
            </div>

            {/* Curriculum & Selector Section */}
            <section className="space-y-4">
              <CurriculumSelector
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
                selectedGrade={selectedGrade}
                setSelectedGrade={setSelectedGrade}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
                onSelectTopic={handleTopicSelect}
              />
            </section>

            {/* Lesson Plan Generation Form */}
            <section className="pt-2">
              <LessonPlanForm
                formData={formData}
                setFormData={setFormData}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </section>
          </div>
        )}

        {activeTab === 'view' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab('generator')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold font-khmer transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>ត្រឡប់ទៅការបង្កើតកិច្ចតែងការ (Back to Generator)</span>
            </button>

            <LessonPlanViewer lessonPlan={generatedPlan} onReset={() => setActiveTab('generator')} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-khmer">
        <p>KruAI (គ្រូ AI - កម្ពុជា) © 2026 • ប្រព័ន្ធគាំទ្រគ្រូបង្រៀនកម្ពុជាពីបឋមសិក្សាដល់វិទ្យាល័យ</p>
      </footer>
    </div>
  );
}
