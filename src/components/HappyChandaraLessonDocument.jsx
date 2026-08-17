import React from 'react';
import {
  CheckCircle2,
  ExternalLink,
  FileQuestion,
  Presentation,
  ShieldCheck,
} from 'lucide-react';

function uniqueMaterials(materials, includeSlides) {
  const values = [...(materials || []), 'សន្លឹកកិច្ចការសិស្ស'];
  if (includeSlides) values.push('Projector និងស្លាយជំនួយបង្រៀន');
  return [...new Set(values.filter(Boolean))];
}

function ProcessTable({ lessonPlan }) {
  const { fiveStepsProcess = [], teacherTemplate } = lessonPlan;
  const isFiveE = teacherTemplate?.processTableMode === 'five-e-activity-time';

  if (!isFiveE) {
    return (
      <table className="w-full text-xs sm:text-sm border-collapse">
        <thead className="bg-slate-950 text-slate-200">
          <tr>
            <th className="border border-slate-700 p-3 w-[35%]">សកម្មភាពគ្រូ</th>
            <th className="border border-slate-700 p-3 w-[35%]">ខ្លឹមសារមេរៀន</th>
            <th className="border border-slate-700 p-3 w-[30%]">សកម្មភាពសិស្ស</th>
          </tr>
        </thead>
        <tbody>
          {fiveStepsProcess.map((step) => (
            <tr key={step.stepIndex} className="align-top">
              <td className="border border-slate-700 p-3 whitespace-pre-line leading-relaxed text-slate-200">
                {step.teacherActivity}
              </td>
              <td className="border border-slate-700 p-3 whitespace-pre-line leading-relaxed text-slate-300">
                <strong className="block text-cyan-300 mb-1">{step.traditionalStepNameKm}</strong>
                {step.lessonContent}
                <span className="block text-[10px] text-slate-500 mt-2">{step.timeMins} នាទី</span>
              </td>
              <td className="border border-slate-700 p-3 whitespace-pre-line leading-relaxed text-slate-300">
                {step.studentActivity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <table className="w-full text-xs sm:text-sm border-collapse">
      <thead className="bg-slate-950 text-slate-200">
        <tr>
          <th className="border border-slate-700 p-3 w-[18%]">5Es</th>
          <th className="border border-slate-700 p-3">សកម្មភាព</th>
          <th className="border border-slate-700 p-3 w-[13%]">ចំនួននាទី</th>
        </tr>
      </thead>
      <tbody>
        {fiveStepsProcess.map((step) => (
          <tr key={step.stepIndex} className="align-top">
            <td className="border border-slate-700 p-3 font-bold text-cyan-300">
              {step.stepNameKm}
            </td>
            <td className="border border-slate-700 p-3 space-y-3 leading-relaxed">
              <div className="whitespace-pre-line text-slate-200">
                <strong className="text-amber-300">សកម្មភាពគ្រូ៖ </strong>
                {step.teacherActivity}
              </div>
              <div className="whitespace-pre-line text-slate-300">
                <strong className="text-emerald-300">សកម្មភាពសិស្ស៖ </strong>
                {step.studentActivity}
              </div>
              <div className="text-slate-400">
                <strong>ការវាយតម្លៃ៖ </strong>{step.evaluation}
              </div>
            </td>
            <td className="border border-slate-700 p-3 text-center font-bold text-slate-100">
              {step.timeMins}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Worksheet({ lessonPlan, showAnswerKey, onToggleAnswerKey }) {
  const { fullWorksheet, teacherTemplate, metadata } = lessonPlan;
  if (!fullWorksheet) return null;
  const worksheet = teacherTemplate?.worksheet || {};

  return (
    <section className="space-y-5 pt-8 border-t-4 border-slate-700 break-before-page">
      <div className="flex items-center justify-between gap-3 border-b border-slate-700 pb-3">
        <div>
          <p className="text-xs text-slate-400">ឯកសារភ្ជាប់ជានិច្ចជាមួយកិច្ចតែងការ</p>
          <h3 className="font-black text-xl text-amber-300 flex items-center gap-2">
            <FileQuestion className="w-5 h-5" /> {fullWorksheet.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onToggleAnswerKey}
          className="no-print px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-cyan-300 flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {showAnswerKey ? 'លាក់ចម្លើយគ្រូ' : 'បង្ហាញចម្លើយគ្រូ'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
          <strong className="text-cyan-300">វត្ថុបំណង៖</strong> {worksheet.objective}
        </div>
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
          <strong className="text-cyan-300">ទិដ្ឋភាពទូទៅ៖</strong> {worksheet.backgroundKnowledge}
        </div>
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 sm:col-span-2">
          <strong className="text-amber-300">សំណួរស្រាវជ្រាវ៖</strong> {worksheet.inquiryQuestion}
          <p className="mt-3 text-slate-400">{worksheet.hypothesisPrompt}</p>
          <div className="mt-3 border-b border-dashed border-slate-600 h-8" />
        </div>
      </div>

      {worksheet.materials?.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-cyan-300">សម្ភារៈ</h4>
          <ul className="list-disc list-inside text-sm text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-1">
            {worksheet.materials.map((material, index) => <li key={index}>{material}</li>)}
          </ul>
        </div>
      )}

      {worksheet.procedure?.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-cyan-300">ដំណើរការសកម្មភាព/ពិសោធ</h4>
          <div className="space-y-2 text-sm text-slate-300">
            {worksheet.procedure.map((step, index) => (
              <p key={index} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">{step}</p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="p-4 rounded-xl border border-slate-800 min-h-28">
          <strong className="text-cyan-300">លទ្ធផល៖</strong>
          <p className="text-slate-400 mt-1">{worksheet.resultsPrompt}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 min-h-28">
          <strong className="text-cyan-300">សន្និដ្ឋាន៖</strong>
          <p className="text-slate-400 mt-1">{worksheet.conclusionPrompt}</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 italic">{fullWorksheet.instructions} · {metadata.grade}</p>
      <div className="space-y-5">
        {fullWorksheet.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4">
            <h4 className="font-bold text-cyan-300 border-b border-slate-800 pb-2">{section.sectionTitle}</h4>
            {section.questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <p className="font-semibold text-slate-100">សំណួរទី {question.id}៖ {question.question}</p>
                {question.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 pl-3">
                    {question.options.map((option, index) => <span key={index}>{option}</span>)}
                  </div>
                )}
                {showAnswerKey && (
                  <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/25 text-emerald-200 text-xs">
                    <strong>កូនសោចម្លើយគ្រូ៖</strong> {question.correctAnswer}
                    {question.explanation && <p className="text-slate-400 mt-1">{question.explanation}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HappyChandaraLessonDocument({
  lessonPlan,
  showAnswerKey,
  onToggleAnswerKey,
}) {
  const {
    metadata,
    objectives,
    teachingAids,
    blackboardSummary,
    teacherTemplate,
    curriculumAnchor,
    enrichmentSources = [],
    publication,
  } = lessonPlan;
  const materials = uniqueMaterials(teachingAids, teacherTemplate?.slideDeck?.enabled);

  return (
    <div className="printable-plan glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 bg-slate-900/90 space-y-7 text-slate-100 font-khmer shadow-2xl">
      <header className="text-center border-b-2 border-slate-700 pb-5 space-y-1">
        <p className="font-bold text-slate-200">{metadata.schoolName}</p>
        <h2 className="text-xl sm:text-2xl font-black text-cyan-300">កិច្ចតែងការបង្រៀន</h2>
        <p className="text-xs text-slate-400">{metadata.templateProfileNameKm}</p>
      </header>

      <section className="space-y-3">
        <h3 className="font-bold text-cyan-300">១-ព័ត៌មានទូទៅ</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <tbody>
              <tr>
                <th className="border border-slate-700 p-2 bg-slate-950">ជំពូក</th>
                <td className="border border-slate-700 p-2">{curriculumAnchor?.chapter || 'ប្រធានបទកំណត់ដោយគ្រូ'}</td>
                <th className="border border-slate-700 p-2 bg-slate-950">មេរៀន</th>
                <td className="border border-slate-700 p-2">{curriculumAnchor?.lesson}</td>
              </tr>
              <tr>
                <th className="border border-slate-700 p-2 bg-slate-950">ប្រធានបទ</th>
                <td className="border border-slate-700 p-2">{metadata.topic}</td>
                <th className="border border-slate-700 p-2 bg-slate-950">ថ្នាក់</th>
                <td className="border border-slate-700 p-2">{metadata.grade}</td>
              </tr>
              <tr>
                <th className="border border-slate-700 p-2 bg-slate-950">មុខវិជ្ជា</th>
                <td className="border border-slate-700 p-2">{metadata.subjectKm}</td>
                <th className="border border-slate-700 p-2 bg-slate-950">រយៈពេល</th>
                <td className="border border-slate-700 p-2">{metadata.duration}</td>
              </tr>
              <tr>
                <th className="border border-slate-700 p-2 bg-slate-950">គ្រូបង្រៀន</th>
                <td className="border border-slate-700 p-2">{metadata.teacherName}</td>
                <th className="border border-slate-700 p-2 bg-slate-950">កាលបរិច្ឆេទ</th>
                <td className="border border-slate-700 p-2">{metadata.date}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-bold text-cyan-300">២-វត្ថុបំណង</h3>
        <table className="w-full border-collapse text-xs sm:text-sm">
          <tbody>
            <tr><th className="border border-slate-700 p-3 bg-slate-950 w-36">វិជ្ជាសម្បទា</th><td className="border border-slate-700 p-3">{objectives.knowledge}</td></tr>
            <tr><th className="border border-slate-700 p-3 bg-slate-950">បំណិនសម្បទា</th><td className="border border-slate-700 p-3">{objectives.skills}</td></tr>
            <tr><th className="border border-slate-700 p-3 bg-slate-950">ចរិយាសម្បទា</th><td className="border border-slate-700 p-3">{objectives.attitude}</td></tr>
          </tbody>
        </table>
      </section>

      <section className="space-y-3">
        <h3 className="font-bold text-cyan-300">៣-សម្ភារឧបទេស</h3>
        <p className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-sm text-slate-300">
          {materials.join(' · ')}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-bold text-cyan-300">៤-ខ្លឹមសារមេរៀន</h3>
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 whitespace-pre-line text-sm text-slate-300 leading-relaxed">
          {blackboardSummary}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-bold text-cyan-300">៥-ដំណើរការបង្រៀន និងរៀន ({metadata.teachingMethodKm})</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <ProcessTable lessonPlan={lessonPlan} />
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center text-sm pt-3">
        <div><p>{metadata.date}</p><p className="font-bold mt-2">គ្រូបង្រៀន</p><p>{metadata.teacherName}</p></div>
        <div><p>បានពិនិត្យខ្លឹមសារ និងពេលវេលាមុនបង្រៀន</p><p className="font-bold mt-2">ហត្ថលេខា</p><p>........................................</p></div>
      </div>

      <Worksheet lessonPlan={lessonPlan} showAnswerKey={showAnswerKey} onToggleAnswerKey={onToggleAnswerKey} />

      {teacherTemplate?.slideDeck?.enabled && (
        <section className="space-y-4 pt-8 border-t-4 border-slate-700 break-before-page">
          <h3 className="font-black text-xl text-purple-300 flex items-center gap-2">
            <Presentation className="w-5 h-5" /> គម្រោងស្លាយជំនួយបង្រៀន (ជាជម្រើស)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teacherTemplate.slideDeck.slides.map((slide) => (
              <article key={slide.slideNumber} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
                <p className="text-[10px] text-purple-300 uppercase">Slide {slide.slideNumber} · {slide.role}</p>
                <h4 className="font-bold text-slate-100">{slide.title}</h4>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {slide.content.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
                <p className="text-[11px] text-slate-500 italic">{slide.visualBriefKm}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3 pt-6 border-t border-slate-700 text-xs">
        <h3 className="font-bold text-cyan-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> ព្រំដែនកម្មវិធីសិក្សា ប្រភព និងសិទ្ធិប្រើប្រាស់
        </h3>
        <p className="text-slate-400">{curriculumAnchor?.scopeNoteKm}</p>
        <p className="text-slate-400">ស្ថានភាព៖ {publication?.status || 'draft'} · {publication?.license || 'CC BY 4.0'}</p>
        {enrichmentSources.map((source) => (
          <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="block text-cyan-300 hover:underline">
            {source.title} · {source.organization} · {source.license} <ExternalLink className="inline w-3 h-3" />
          </a>
        ))}
      </section>
    </div>
  );
}
