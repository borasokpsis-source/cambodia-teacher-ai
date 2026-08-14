import React, { useState } from 'react';
import { shareToTelegram, exportToWord, printLessonPlan } from '../services/exportUtils';
import { refineLessonPlan } from '../services/aiRefiningService';
import {
  Share2,
  FileText,
  Printer,
  Copy,
  Check,
  Sparkles,
  Wrench,
  Activity,
  Brain,
  AlertTriangle,
  Users,
  BarChart3,
  Send,
  Gamepad2,
  HelpCircle,
  BookOpen,
  FileQuestion,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

export default function LessonPlanViewer({ lessonPlan: initialPlan, onReset }) {
  const [currentPlan, setCurrentPlan] = useState(initialPlan);
  const [copied, setCopied] = useState(false);
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(true);

  if (!currentPlan) return null;

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
    gameActivity,
    examPrepSection,
    fullWorksheet,
  } = currentPlan;

  const handleCopy = () => {
    const text = `កិច្ចតែងការបង្រៀន (${metadata.teachingMethodKm})៖ ${metadata.topic} (${metadata.subjectKm} ${metadata.grade})\nសាលារៀន៖ ${metadata.schoolName}\nគ្រូបង្រៀន៖ ${metadata.teacherName}\nបំណិនវិទ្យាសាស្ត្រ៖ ${metadata.processSkillsKm}\n\nវត្ថុបំណង៖\n១. ពុទ្ធិ៖ ${objectives.knowledge}\n២. បំណិន៖ ${objectives.skills}\n៣. ឥរិយាបថ៖ ${objectives.attitude}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefinement = async (promptText) => {
    if (!promptText.trim()) return;
    setIsRefining(true);
    try {
      const updatedPlan = await refineLessonPlan(currentPlan, promptText);
      setCurrentPlan(updatedPlan);
      setRefinementInput('');
    } catch (err) {
      console.error('Refinement failed:', err);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (No Print) */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-sm font-bold text-slate-100 font-khmer">
            កិច្ចតែងការបង្រៀនលម្អិត ({metadata.teachingMethodKm})
          </span>
          {metadata.isRealAiGenerated ? (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-sans">
              🤖 {metadata.aiModelUsed || 'Gemini 2.0 Flash'}
            </span>
          ) : (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold font-khmer">
              ⚡ Local Smart Engine
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => shareToTelegram(currentPlan)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-khmer text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>ចែករំឡែក Telegram</span>
          </button>

          <button
            onClick={() => exportToWord(currentPlan)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-khmer text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ទាញយកជា Word (.doc)</span>
          </button>

          <button
            onClick={printLessonPlan}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-khmer text-xs font-semibold flex items-center gap-2 transition-all border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>បោះពុម្ព / Save PDF</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-khmer text-xs font-medium flex items-center gap-1.5 transition-all border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'បានចម្លង!' : 'ចម្លងអត្ថបទ'}</span>
          </button>
        </div>
      </div>

      {/* API Warning Diagnostic Banner (if Gemini API failed or was fallback) */}
      {metadata.apiError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-khmer space-y-1 no-print shadow-md">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>ការជូនដំណឹងពី Gemini API:</span>
          </div>
          <p className="text-amber-300/90 leading-relaxed">
            {metadata.apiError}. KruAI បានដំណើរការ <strong> Local Smart Engine</strong> ជំនួស ដើម្បីបង្កើតកិច្ចតែងការស្របតាមប្រធានបទ 100% ដោយមិនឱ្យរំខានដល់ការបង្រៀន!
          </p>
        </div>
      )}

      {/* AI Live Refinement Bar (No Print) */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-slate-900/90 space-y-3 no-print shadow-xl shadow-cyan-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <h4 className="text-xs font-bold text-cyan-300 font-khmer">
              ប្រព័ន្ធ AI កែសម្រួលមេរៀនផ្ទាល់ (Live AI Refinement Bar):
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-khmer">
            វាយបញ្ចូលសំណើកែប្រែ ឬ ចុចប៊ូតុងកាត់ខាងក្រោម
          </span>
        </div>

        {/* Quick Action Suggestion Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: '🎮 បន្ថែមល្បែងសិក្សា ៥ នាទី', prompt: 'បន្ថែមល្បែងសិក្សា ៥ នាទី' },
            { label: '📝 បន្ថែមសំណួរប្រឡងបាក់ឌុប', prompt: 'បន្ថែមសំណួរប្រឡង' },
            { label: '♻️ ប្រើសម្ភារកែច្នៃក្នុងស្រុក', prompt: 'ប្រើសម្ភារកែច្នៃ' },
            { label: '🌐 ខ្មែរ-អង់គ្លេសទន្ទឹមគ្នា (Bilingual)', prompt: 'Bilingual' },
          ].map((pill, idx) => (
            <button
              key={idx}
              disabled={isRefining}
              onClick={() => handleRefinement(pill.prompt)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-900/40 text-slate-300 hover:text-cyan-300 border border-slate-700 text-xs font-khmer transition-all flex items-center gap-1.5"
            >
              <span>{pill.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={refinementInput}
            onChange={(e) => setRefinementInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRefinement(refinementInput)}
            placeholder="ឧទាហរណ៍៖ បន្ថែមសកម្មភាពក្រុម ៥ នាទី ឬ បន្ថែមសំណួរពិភាក្សា..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 text-xs font-khmer text-slate-100 placeholder-slate-500 outline-none"
          />
          <button
            disabled={isRefining || !refinementInput.trim()}
            onClick={() => handleRefinement(refinementInput)}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-khmer flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50"
          >
            {isRefining ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>កែសម្រួល</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Sheet */}
      <div className="printable-plan glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 bg-slate-900/90 space-y-8 text-slate-100 font-khmer shadow-2xl">
        {/* National Header */}
        <div className="text-center space-y-1 border-b border-slate-800 pb-6">
          <p className="text-xs font-bold tracking-wider text-slate-300">ព្រះរាជាណាចក្រកម្ពុជា</p>
          <p className="text-xs font-bold text-slate-300">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 via-amber-400 to-red-500 mx-auto my-2"></div>
          <h2 className="text-xl sm:text-2xl font-black text-cyan-400 pt-2">
            កិច្ចតែងការបង្រៀនលម្អិតសម្រាប់បង្រៀនផ្ទាល់ ({metadata.teachingMethodKm})
          </h2>
          <p className="text-xs text-slate-400">ស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា & STEM (មានអត្ថបទនិយាយផ្ទាល់ និង សន្លឹកកិច្ចការ)</p>
        </div>

        {/* General Info Metadata Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 text-xs sm:text-sm">
          <div>
            <span className="text-slate-400">សាលារៀន៖</span>{' '}
            <strong className="text-slate-100">{metadata.schoolName}</strong>
          </div>
          <div>
            <span className="text-slate-400">កាលបរិច្ឆេទ៖</span>{' '}
            <strong className="text-slate-100">{metadata.date}</strong>
          </div>
          <div>
            <span className="text-slate-400">គ្រូបង្រៀន៖</span>{' '}
            <strong className="text-slate-100">{metadata.teacherName}</strong>
          </div>
          <div>
            <span className="text-slate-400">ថ្នាក់រៀន៖</span>{' '}
            <strong className="text-slate-100">{metadata.grade}</strong>
          </div>
          <div>
            <span className="text-slate-400">មុខវិជ្ជា៖</span>{' '}
            <strong className="text-cyan-300">{metadata.subjectKm} ({metadata.subjectEn})</strong>
          </div>
          <div>
            <span className="text-slate-400">រយៈពេល៖</span>{' '}
            <strong className="text-slate-100">{metadata.duration}</strong>
          </div>
          <div className="sm:col-span-2 pt-2 border-t border-slate-800/60">
            <span className="text-slate-400">វិធីសាស្ត្របង្រៀន៖</span>{' '}
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold text-xs ml-1">
              {metadata.teachingMethodKm}
            </span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-400">បំណិនដំណើរការវិទ្យាសាស្ត្រ៖</span>{' '}
            <span className="text-amber-300 font-medium">{metadata.processSkillsKm}</span>
          </div>
          <div className="sm:col-span-2 pt-1 border-t border-slate-800/60">
            <span className="text-slate-400">ប្រធានបទមេរៀន៖</span>{' '}
            <strong className="text-cyan-400 text-base">{metadata.topic}</strong>
          </div>
        </div>

        {/* Section 1: Objectives */}
        <div className="space-y-3">
          <h3 className="font-bold text-base text-cyan-300 flex items-center gap-2 border-l-4 border-cyan-500 pl-3">
            I. វត្ថុបំណង (OBJECTIVES)
          </h3>
          <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm leading-relaxed">
            <p>
              <strong className="text-emerald-400">១. ពុទ្ធិ (Knowledge):</strong> {objectives.knowledge}
            </p>
            <p>
              <strong className="text-blue-400">២. បំណិន (Skills & Science Process):</strong> {objectives.skills}
            </p>
            <p>
              <strong className="text-purple-400">៣. ឥរិយាបថ (Attitude):</strong> {objectives.attitude}
            </p>
          </div>
        </div>

        {/* Blackboard Notes Box (ខ្លឹមសារសរសេរលើក្តារខៀន) */}
        {blackboardSummary && (
          <div className="space-y-3">
            <h3 className="font-bold text-base text-amber-400 flex items-center gap-2 border-l-4 border-amber-500 pl-3">
              <BookOpen className="w-4 h-4 text-amber-400" />
              ខ្លឹមសារមេរៀនសំខាន់សម្រាប់សរសេរលើក្តារខៀន (Blackboard Notes Script)
            </h3>
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs sm:text-sm text-cyan-300 leading-relaxed whitespace-pre-line shadow-inner">
              {blackboardSummary}
            </div>
          </div>
        )}

        {/* Smart Layer 1: Misconceptions Alert Box */}
        {misconceptionsAlert && (
          <div className="space-y-3">
            <h3 className="font-bold text-base text-rose-400 flex items-center gap-2 border-l-4 border-rose-500 pl-3">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              {misconceptionsAlert.title}
            </h3>
            <div className="bg-rose-950/20 border border-rose-500/30 p-5 rounded-2xl space-y-2 text-xs sm:text-sm">
              <p className="text-rose-200">
                <strong>⚠️ ការយល់ច្រឡំប្រចាំមេរៀន៖</strong> {misconceptionsAlert.commonMisconception}
              </p>
              <p className="text-amber-300">
                {misconceptionsAlert.diagnosticQuestion}
              </p>
              <p className="text-slate-300">
                {misconceptionsAlert.teacherIntervention}
              </p>
            </div>
          </div>
        )}

        {/* Smart Layer 2: Differentiated Instruction */}
        {differentiatedInstruction && (
          <div className="space-y-3">
            <h3 className="font-bold text-base text-emerald-400 flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
              <Users className="w-4 h-4 text-emerald-400" />
              {differentiatedInstruction.title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <p className="text-emerald-300 font-bold">🚀 សិស្សរៀនលឿន/ពូកែ</p>
                <p className="text-slate-300">{differentiatedInstruction.fastLearners}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <p className="text-amber-300 font-bold">🪜 សិស្សរៀនយឺត (Scaffolding)</p>
                <p className="text-slate-300">{differentiatedInstruction.strugglingLearners}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <p className="text-purple-300 font-bold">♿ ការអប់រំបរិយាបន្ន</p>
                <p className="text-slate-300">{differentiatedInstruction.specialNeeds}</p>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Hands-On Activity Blueprint */}
        {handsOnActivity && (
          <div className="space-y-3">
            <h3 className="font-bold text-base text-amber-400 flex items-center gap-2 border-l-4 border-amber-500 pl-3">
              II. {handsOnActivity.title}
            </h3>
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="space-y-1.5">
                <h4 className="font-semibold text-xs text-cyan-300 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  សម្ភារអនុវត្ត និងឧបករណ៍ពិសោធន៍ (Materials Needed):
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-2">
                  {handsOnActivity.materialsNeeded.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-semibold text-xs text-cyan-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  ជំហានអនុវត្តសកម្មភាពផ្ទាល់ដៃ (Procedure):
                </h4>
                <div className="space-y-1.5 text-xs text-slate-200">
                  {handsOnActivity.steps.map((st, idx) => (
                    <p key={idx} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      {st}
                    </p>
                  ))}
                </div>
              </div>

              {handsOnActivity.thinkingPrompts && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <h4 className="font-semibold text-xs text-purple-300 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    សំណួរដាស់គំនិតត្រិះរិះសិស្ស (Critical Thinking Prompts):
                  </h4>
                  <div className="space-y-1 text-xs text-slate-300 italic">
                    {handsOnActivity.thinkingPrompts.map((pr, idx) => (
                      <p key={idx}>{pr}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 3: Teaching Aids */}
        <div className="space-y-3">
          <h3 className="font-bold text-base text-cyan-300 flex items-center gap-2 border-l-4 border-cyan-500 pl-3">
            III. សម្ភារឧបទេស (TEACHING MATERIALS)
          </h3>
          <ul className="list-disc list-inside bg-slate-950/40 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm space-y-1.5 text-slate-200">
            {teachingAids.map((aid, idx) => (
              <li key={idx}>{aid}</li>
            ))}
          </ul>
        </div>

        {/* Section 4: Scripted Process Matrix (5E / MoEYS / PBL) */}
        <div className="space-y-3">
          <h3 className="font-bold text-base text-cyan-300 flex items-center gap-2 border-l-4 border-cyan-500 pl-3">
            IV. ដំណើរការបង្រៀន និងរៀនលម្អិត - មានអត្ថបទនិយាយផ្ទាល់ ({metadata.teachingMethodKm})
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead className="bg-slate-950 text-slate-200 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3 w-1/5">ជំហាន / រយៈពេល</th>
                  <th className="p-3 w-2/5">សកម្មភាពគ្រូ (TEACHER SCRIPT & DIALOGUE)</th>
                  <th className="p-3 w-1/4">សកម្មភាពសិស្ស (STUDENT RESPONSE)</th>
                  <th className="p-3 w-1/6">ការវាយតម្លៃ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {fiveStepsProcess.map((step) => (
                  <tr key={step.stepIndex} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-cyan-300 align-top">
                      {step.stepNameKm}
                      <span className="block text-[11px] text-slate-400 font-normal mt-0.5">
                        ({step.timeMins} នាទី)
                      </span>
                    </td>
                    <td className="p-3 whitespace-pre-line text-slate-200 align-top leading-relaxed">
                      {step.teacherActivity}
                    </td>
                    <td className="p-3 whitespace-pre-line text-slate-300 align-top leading-relaxed">
                      {step.studentActivity}
                    </td>
                    <td className="p-3 text-slate-400 align-top text-xs">
                      {step.evaluation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Full 5-Question Printable Student Worksheet & Teacher Answer Key */}
        {fullWorksheet && (
          <div className="space-y-6 pt-6 border-t-2 border-slate-800">
            {/* Student Worksheet Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-lg text-amber-400 flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-amber-400" />
                {fullWorksheet.title}
              </h3>
              <button
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-khmer text-cyan-300 border border-slate-700 flex items-center gap-1.5 no-print"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{showAnswerKey ? 'លាក់កូនសោចម្លើយគ្រូ' : 'បង្ហាញកូនសោចម្លើយគ្រូ'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              {fullWorksheet.instructions}
            </p>

            {/* Sections 1, 2, 3 */}
            <div className="space-y-6 text-xs sm:text-sm">
              {fullWorksheet.sections.map((sec, sIdx) => (
                <div key={sIdx} className="space-y-3 bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
                  <h4 className="font-bold text-sm text-cyan-300 font-khmer border-b border-slate-800 pb-2">
                    {sec.sectionTitle}
                  </h4>
                  <div className="space-y-4">
                    {sec.questions.map((q) => (
                      <div key={q.id} className="space-y-2 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <p className="font-semibold text-slate-100">
                          សំណួរទី {q.id}៖ {q.question}
                        </p>

                        {/* Options if MCQ */}
                        {q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3 pt-1">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="p-2 rounded-lg bg-slate-950/60 text-slate-300 border border-slate-800/80">
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Teacher Answer Key Box */}
                        {showAnswerKey && (
                          <div className="mt-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                            <p className="font-bold flex items-center gap-1.5">
                              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                              🔑 កូនសោចម្លើយគ្រូ (Teacher Answer Key):
                            </p>
                            <p className="font-semibold text-emerald-200">{q.correctAnswer}</p>
                            {q.explanation && (
                              <p className="text-[11px] text-slate-400 italic pt-0.5">
                                💡 ការបកស្រាយ៖ {q.explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
