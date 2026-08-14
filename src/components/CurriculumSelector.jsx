import React from 'react';
import {
  EDUCATION_LEVELS,
  SUBJECTS_BY_LEVEL,
  SAMPLE_TOPICS_BY_SUBJECT,
  OFFICIAL_MOEYS_TEXTBOOKS,
} from '../data/moeysCurriculum';
import {
  BookOpen,
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  Mountain,
  Landmark,
  Compass,
  HeartHandshake,
  Languages,
  Laptop,
  Palette,
  Globe,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

const ICON_MAP = {
  BookOpen,
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  Mountain,
  Landmark,
  Compass,
  HeartHandshake,
  Languages,
  Laptop,
  Palette,
  Globe,
  TrendingUp,
};

export default function CurriculumSelector({
  selectedLevel,
  setSelectedLevel,
  selectedGrade,
  setSelectedGrade,
  selectedSubject,
  setSelectedSubject,
  onSelectTopic,
}) {
  const currentLevelObj = EDUCATION_LEVELS.find((l) => l.id === selectedLevel) || EDUCATION_LEVELS[1];
  const currentSubjects = SUBJECTS_BY_LEVEL[selectedLevel] || SUBJECTS_BY_LEVEL.lower_secondary;

  // Check if we have parsed official MoEYS textbook data for this grade & subject
  const getOfficialTextbookData = () => {
    if (selectedSubject?.id === 'biology' && selectedGrade >= 10) {
      return OFFICIAL_MOEYS_TEXTBOOKS[`biology_g${selectedGrade}`];
    }
    if (selectedSubject?.id === 'science' && selectedGrade >= 7 && selectedGrade <= 9) {
      return OFFICIAL_MOEYS_TEXTBOOKS[`science_g${selectedGrade}`];
    }
    return null;
  };

  const officialTextbook = getOfficialTextbookData();

  return (
    <div className="space-y-6">
      {/* Educational Level Selection Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-slate-800">
        <div className="text-sm font-semibold text-slate-300 font-khmer px-2 flex items-center gap-2">
          <span>ជ្រើសរើសកម្រិតសិក្សា (Level):</span>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
          {EDUCATION_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => {
                setSelectedLevel(level.id);
                setSelectedGrade(level.grades[0]);
                setSelectedSubject(SUBJECTS_BY_LEVEL[level.id][0]);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-center flex flex-col items-center gap-0.5 ${
                selectedLevel === level.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="font-khmer font-bold">{level.nameKm}</span>
              <span className="text-[10px] opacity-75">{level.nameEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grade Selector Pills */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-200 font-khmer flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            ជ្រើសរើសថ្នាក់រៀន (Grade Level):
          </h4>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${currentLevelObj.badgeColor}`}>
            {currentLevelObj.nameKm} (Grades {currentLevelObj.grades.join(', ')})
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {currentLevelObj.grades.map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedGrade === grade
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span className="font-khmer">ថ្នាក់ទី {grade}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subject Grid */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-200 font-khmer flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          ជ្រើសរើសមុខវិជ្ជា (Select Subject for Grade {selectedGrade}):
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {currentSubjects.map((subj) => {
            const IconComp = ICON_MAP[subj.icon] || BookOpen;
            const isSelected = selectedSubject?.id === subj.id;

            return (
              <div
                key={subj.id}
                onClick={() => setSelectedSubject(subj)}
                className={`cursor-pointer p-4 rounded-2xl glass-card relative overflow-hidden group border ${
                  isSelected
                    ? 'border-cyan-500/80 bg-slate-900/90 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                        : 'bg-slate-800 text-cyan-400 group-hover:bg-cyan-900/30'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  {subj.isOfficial && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md">
                      MoEYS PDF
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h5 className="font-bold text-sm text-slate-100 font-khmer line-clamp-1">
                    {subj.nameKm}
                  </h5>
                  <p className="text-xs text-slate-400 font-sans truncate">{subj.nameEn}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official MoEYS PDF Textbook Chapters View */}
      {officialTextbook ? (
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-slate-900/90 space-y-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-amber-300 font-khmer">
                  {officialTextbook.titleKm}
                </h4>
                <p className="text-xs text-slate-400 font-khmer">
                  មាតិកាផ្លូវការទាញចេញពីសៀវភៅពុម្ពក្រសួង (Official MoEYS Textbook Chapters)
                </p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> ផ្ទៀងផ្ទាត់រួច (Verified)
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {officialTextbook.chapters.map((ch, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h5 className="font-bold text-xs sm:text-sm text-cyan-300 font-khmer">
                  {ch.chapterKm}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ch.lessons.map((les, lIdx) => (
                    <div
                      key={lIdx}
                      onClick={() => onSelectTopic(`${ch.chapterKm} - ${les}`)}
                      className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <span className="text-xs font-medium text-slate-200 font-khmer line-clamp-1">
                        {les}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Default Topics View */
        selectedSubject && (
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-cyan-300 font-khmer flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  ប្រធានបទគំរូតាមសៀវភៅពុម្ព (MoEYS Standard Topics - {selectedSubject.nameKm}):
                </h4>
                <p className="text-xs text-slate-400 font-khmer mt-0.5">
                  ចុចលើប្រធានបទណាមួយដើម្បីបង្កើតកិច្ចតែងការភ្លាមៗ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {(SAMPLE_TOPICS_BY_SUBJECT[selectedSubject.id] || SAMPLE_TOPICS_BY_SUBJECT.math).map(
                (topic, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectTopic(topic)}
                    className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800/90 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <span className="text-xs sm:text-sm font-medium text-slate-200 font-khmer line-clamp-1">
                      {topic}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </div>
                )
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
