import React from 'react';
import { RESOURCE_LEVELS, TEACHING_METHODS, SCIENCE_PROCESS_SKILLS } from '../data/moeysCurriculum';
import { Sparkles, Clock, School, User, BookOpen, Layers, Cpu, Compass, Activity, Brain, Check } from 'lucide-react';

export default function LessonPlanForm({
  formData,
  setFormData,
  onGenerate,
  isGenerating,
}) {
  const toggleSkill = (skillId) => {
    const current = formData.selectedSkills || [];
    if (current.includes(skillId)) {
      setFormData({ ...formData, selectedSkills: current.filter((s) => s !== skillId) });
    } else {
      setFormData({ ...formData, selectedSkills: [...current, skillId] });
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-100 font-khmer flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            ព័ត៌មានបង្កើតកិច្ចតែងការ (Lesson Plan Details)
          </h3>
          <p className="text-xs text-slate-400 font-khmer mt-0.5">
            ជ្រើសរើសវិធីសាស្ត្របង្រៀន (5E, PBL, STEM) និង បំណិនដំណើរការវិទ្យាសាស្ត្រសម្រាប់សិស្ស
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {localStorage.getItem('kruai_gemini_key')?.trim() || import.meta.env.VITE_GEMINI_API_KEY?.trim() ? (
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1 font-khmer">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Gemini AI Connected
            </span>
          ) : (
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1 font-khmer">
              ⚡ Local Smart Engine
            </span>
          )}
        </div>
      </div>

      {/* Teaching Method Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-200 font-khmer flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-cyan-400" />
          វិធីសាស្ត្របង្រៀន (Teaching Method / Pedagogy):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TEACHING_METHODS.map((m) => {
            const isSelected = formData.teachingMethod === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setFormData({ ...formData, teachingMethod: m.id })}
                className={`p-3 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/80 ring-1 ring-cyan-500/30 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.badge}`}>
                    {m.nameEn.split(' ')[0]}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <div className="mt-1">
                  <h5 className="font-bold text-xs text-slate-100 font-khmer">{m.nameKm}</h5>
                  <p className="text-[10px] text-slate-400 font-khmer line-clamp-1 mt-0.5">{m.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Science Process Skills Selector (បំណិនដំណើរការវិទ្យាសាស្ត្រ) */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-cyan-300 font-khmer flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            បំណិនដំណើរការវិទ្យាសាស្ត្រ (Embedded Science Process Skills):
          </label>
          <span className="text-[10px] text-slate-400 font-khmer">
            ជ្រើសរើសបានច្រើន ({formData.selectedSkills?.length || 0} បំណិន)
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
          {SCIENCE_PROCESS_SKILLS.map((skill) => {
            const isSelected = (formData.selectedSkills || []).includes(skill.id);
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleSkill(skill.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-khmer transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <span>{skill.nameKm}</span>
                {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
        {/* School Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 font-khmer flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-cyan-400" />
            ឈ្មោះសាលារៀន (School Name):
          </label>
          <input
            type="text"
            value={formData.schoolName}
            onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
            placeholder="ឧទាហរណ៍៖ សាលារៀន ហ៊ុន សែន ភ្នំពេញ"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-khmer text-slate-100 placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Teacher Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 font-khmer flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            ឈ្មោះគ្រូបង្រៀន (Teacher Name):
          </label>
          <input
            type="text"
            value={formData.teacherName}
            onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
            placeholder="ឧទាហរណ៍៖ គ្រូបង្រៀន អ៊ុក សុផល"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-khmer text-slate-100 placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Lesson Topic */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 font-khmer flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            ប្រធានបទមេរៀន (Lesson Topic / Title):
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="ឧទាហរណ៍៖ រស្មីសំយោគ (Photosynthesis) ឬ សមីការដឺក្រេទី១"
            className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-khmer text-slate-100 placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Duration Mins */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 font-khmer flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            រយៈពេលបង្រៀន (Duration):
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[45, 90].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setFormData({ ...formData, durationMins: mins })}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  formData.durationMins === mins
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span className="font-khmer">{mins} នាទី ({mins} mins)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Resource Level */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 font-khmer flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            សម្ភារឧបទេស (Resource Level):
          </label>
          <select
            value={formData.resourceLevel}
            onChange={(e) => setFormData({ ...formData, resourceLevel: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs font-khmer text-slate-100 outline-none"
          >
            {RESOURCE_LEVELS.map((r) => (
              <option key={r.id} value={r.id} className="bg-slate-900 text-slate-100">
                {r.nameKm} ({r.nameEn})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Generate AI Button */}
      <div className="pt-2">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !formData.topic}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-xl ${
            isGenerating
              ? 'bg-cyan-800 text-slate-300 cursor-not-allowed opacity-80'
              : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white shadow-cyan-500/25 active:scale-[0.99]'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="font-khmer">កំពុងបង្កើតកិច្ចតែងការ (Generating Lesson Plan)...</span>
            </>
          ) : (
            <>
              <Cpu className="w-5 h-5 text-cyan-300 animate-pulse" />
              <span className="font-khmer">បង្កើតកិច្ចតែងការដោយ AI (Generate Lesson Plan)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
