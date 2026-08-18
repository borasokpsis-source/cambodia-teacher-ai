import React, { useState } from 'react';
import { RESOURCE_LEVELS, TEACHING_METHODS, SCIENCE_PROCESS_SKILLS } from '../data/moeysCurriculum';
import {
  loadLessonSubtitleOptions,
  saveLessonSubtitleOptions,
} from '../services/sessionSubtitleStorage';
import {
  Sparkles,
  Clock,
  School,
  User,
  BookOpen,
  Layers,
  Cpu,
  Compass,
  Activity,
  Check,
  Globe2,
  Presentation,
  Bot,
  Cloud,
  WifiOff,
  ShieldCheck,
  AlertTriangle,
  ListChecks,
  Plus,
  X,
} from 'lucide-react';

export default function LessonPlanForm({
  formData,
  setFormData,
  onGenerate,
  isGenerating,
  selectedResourceCount = 0,
  openAIStatus = { configured: false, model: 'gpt-5.6-terra', loading: true },
  anthropicStatus = { configured: false, model: 'claude-opus-5', loading: true },
}) {
  const [subtitleDraft, setSubtitleDraft] = useState('');
  const geminiConnected = Boolean(
    localStorage.getItem('kruai_gemini_key')?.trim() || import.meta.env.VITE_GEMINI_API_KEY?.trim(),
  );
  const selectedProvider = formData.aiProvider || 'anthropic';
  const openAIUnavailable =
    selectedProvider === 'openai' && !openAIStatus.loading && !openAIStatus.configured;
  const openAIBlocked =
    selectedProvider === 'openai' && (openAIStatus.loading || !openAIStatus.configured);
  const anthropicUnavailable =
    selectedProvider === 'anthropic' &&
    !anthropicStatus.loading &&
    !anthropicStatus.configured;
  const anthropicBlocked =
    selectedProvider === 'anthropic' &&
    (anthropicStatus.loading || !anthropicStatus.configured);
  const durationMins = Number(formData.durationMins);
  const durationIsValid = durationMins >= 50 && durationMins <= 100;
  const generationDisabled =
    isGenerating || !formData.topic.trim() || !durationIsValid || openAIBlocked || anthropicBlocked;
  const subtitleOptions = formData.subtitleOptions || [];
  const selectedSubtitles = formData.selectedSubtitles || [];

  const providerBadge = {
    openai: {
      label: openAIStatus.configured
        ? `OpenAI · ${openAIStatus.model || 'configured'}`
        : 'OpenAI · setup required',
      className: openAIStatus.configured
        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        : 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
    anthropic: {
      label: anthropicStatus.configured
        ? `Claude · ${anthropicStatus.model || 'configured'}`
        : 'Claude · setup required',
      className: anthropicStatus.configured
        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        : 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
    gemini: {
      label: geminiConnected ? 'Gemini · connected' : 'Gemini · setup required',
      className: geminiConnected
        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        : 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
    offline: {
      label: 'Local Smart Engine',
      className: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    },
  }[selectedProvider];

  const toggleSkill = (skillId) => {
    const current = formData.selectedSkills || [];
    if (current.includes(skillId)) {
      setFormData({ ...formData, selectedSkills: current.filter((s) => s !== skillId) });
    } else {
      setFormData({ ...formData, selectedSkills: [...current, skillId] });
    }
  };

  const addSubtitleOptions = () => {
    const additions = subtitleDraft
      .split(/\r?\n/)
      .map((subtitle) => subtitle.trim())
      .filter(Boolean);
    if (additions.length === 0) return;

    const nextOptions = [...new Set([...subtitleOptions, ...additions])];
    const nextSelected = [...new Set([...selectedSubtitles, ...additions])];
    saveLessonSubtitleOptions(formData.topic, nextOptions);
    setFormData({
      ...formData,
      subtitleOptions: nextOptions,
      selectedSubtitles: nextSelected,
    });
    setSubtitleDraft('');
  };

  const toggleSubtitle = (subtitle) => {
    const nextSelected = selectedSubtitles.includes(subtitle)
      ? selectedSubtitles.filter((item) => item !== subtitle)
      : [...selectedSubtitles, subtitle];
    setFormData({ ...formData, selectedSubtitles: nextSelected });
  };

  const removeSubtitle = (subtitle) => {
    const nextOptions = subtitleOptions.filter((item) => item !== subtitle);
    saveLessonSubtitleOptions(formData.topic, nextOptions);
    setFormData({
      ...formData,
      subtitleOptions: nextOptions,
      selectedSubtitles: selectedSubtitles.filter((item) => item !== subtitle),
    });
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
          <span
            className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold flex items-center gap-1 font-khmer ${providerBadge.className}`}
          >
            <span className="w-2 h-2 rounded-full bg-current opacity-80"></span>
            {providerBadge.label}
          </span>
        </div>
      </div>

      {/* AI Provider Selector */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-slate-200 font-khmer flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-cyan-400" />
          ម៉ាស៊ីន AI សម្រាប់បង្កើតមេរៀន (AI Provider):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            {
              id: 'anthropic',
              title: 'Claude',
              description: anthropicStatus.loading
                ? 'កំពុងពិនិត្យការកំណត់...'
                : anthropicStatus.configured
                  ? `${anthropicStatus.model} · Secure server key`
                  : 'ត្រូវកំណត់ API key នៅលើ server',
              icon: Bot,
              ready: anthropicStatus.configured,
            },
            {
              id: 'openai',
              title: 'OpenAI',
              description: openAIStatus.loading
                ? 'កំពុងពិនិត្យការកំណត់...'
                : openAIStatus.configured
                  ? `${openAIStatus.model} · Secure server key`
                  : 'ត្រូវកំណត់ API key នៅលើ server',
              icon: ShieldCheck,
              ready: openAIStatus.configured,
            },
            {
              id: 'gemini',
              title: 'Gemini',
              description: geminiConnected ? 'API key បានតភ្ជាប់' : 'ត្រូវបញ្ចូល API key',
              icon: Cloud,
              ready: geminiConnected,
            },
            {
              id: 'offline',
              title: 'Offline Draft',
              description: 'មិនប្រើ API · គុណភាពមូលដ្ឋាន',
              icon: WifiOff,
              ready: true,
            },
          ].map((provider) => {
            const isSelected = selectedProvider === provider.id;
            const Icon = provider.icon;
            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => setFormData({ ...formData, aiProvider: provider.id })}
                className={`p-3 rounded-2xl text-left transition-all border ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/80 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-100">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    {provider.title}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${provider.ready ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  ></span>
                </span>
                <span className="block mt-1.5 text-[10px] text-slate-400 font-khmer leading-relaxed">
                  {provider.description}
                </span>
              </button>
            );
          })}
        </div>
        {openAIUnavailable && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
            <AlertTriangle className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed text-amber-200 font-khmer">
              បន្ថែម <code className="font-mono">OPENAI_API_KEY</code> ក្នុងឯកសារ{' '}
              <code className="font-mono">.env.local</code> ហើយចាប់ផ្ដើម server ឡើងវិញ។ API key
              មិនត្រូវបានបញ្ជូនទៅ browser ទេ។
            </p>
          </div>
        )}
        {anthropicUnavailable && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
            <AlertTriangle className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed text-amber-200 font-khmer">
              បន្ថែម <code className="font-mono">ANTHROPIC_API_KEY</code> ក្នុងឯកសារ{' '}
              <code className="font-mono">.env.local</code> ហើយចាប់ផ្ដើម server ឡើងវិញ។ API key
              មិនត្រូវបានបញ្ជូនទៅ browser ទេ។
            </p>
          </div>
        )}
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
            placeholder="ឧទាហរណ៍៖ សាលាហេបភីច័ន្ទតារានារីព្រែកថ្មី"
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
            placeholder="ឧទាហរណ៍៖ សុខ បូរ៉ា"
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
            onChange={(e) =>
              setFormData({
                ...formData,
                topic: e.target.value,
                subtitleOptions: loadLessonSubtitleOptions(e.target.value),
                selectedSubtitles: [],
                customSessionFocus: '',
              })
            }
            placeholder="ឧទាហរណ៍៖ រស្មីសំយោគ (Photosynthesis) ឬ សមីការដឺក្រេទី១"
            className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-khmer text-slate-100 placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Session subtitle scope */}
        <div className="md:col-span-2 rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-cyan-200 font-khmer flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-cyan-400" />
                ចំណងជើងរងសម្រាប់សម័យបង្រៀននេះ (Session Subtitles)
              </label>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400 font-khmer">
                បញ្ចូលចំណងជើងរងមួយក្នុងមួយបន្ទាត់ ហើយជ្រើសតែខ្លឹមសារដែលត្រូវបង្រៀនក្នុងសម័យនេះ។ បើមិនជ្រើស ប្រព័ន្ធនឹងរៀបចំមេរៀនទាំងមូល។
              </p>
            </div>
            {subtitleOptions.length > 0 && (
              <span className="shrink-0 rounded-full border border-cyan-500/25 bg-slate-950 px-2.5 py-1 text-[10px] font-khmer text-cyan-300">
                បានជ្រើស {selectedSubtitles.length}/{subtitleOptions.length}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <textarea
              value={subtitleDraft}
              onChange={(event) => setSubtitleDraft(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                  event.preventDefault();
                  addSubtitleOptions();
                }
              }}
              rows={2}
              placeholder={'ឧទាហរណ៍៖\n១. និយមន័យល្បឿន\n២. រូបមន្ត និងឯកតាល្បឿន'}
              className="min-h-20 flex-1 resize-y rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-khmer"
            />
            <button
              type="button"
              onClick={addSubtitleOptions}
              disabled={!subtitleDraft.trim()}
              className="sm:self-stretch inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 font-khmer"
            >
              <Plus className="w-4 h-4" /> បន្ថែម
            </button>
          </div>

          {subtitleOptions.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex flex-wrap gap-2">
                {subtitleOptions.map((subtitle) => {
                  const isSelected = selectedSubtitles.includes(subtitle);
                  return (
                    <div
                      key={subtitle}
                      className={`inline-flex items-stretch overflow-hidden rounded-xl border transition-colors ${
                        isSelected
                          ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-100'
                          : 'border-slate-700 bg-slate-900/70 text-slate-400'
                      }`}
                    >
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleSubtitle(subtitle)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-left text-xs font-khmer"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                              : 'border-slate-600 bg-slate-950'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </span>
                        {subtitle}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSubtitle(subtitle)}
                        aria-label={`Remove ${subtitle}`}
                        className="border-l border-current/15 px-2 text-current/60 transition-colors hover:bg-rose-500/15 hover:text-rose-300"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, selectedSubtitles: [...subtitleOptions] })}
                  className="text-[10px] font-semibold text-cyan-300 hover:text-cyan-200 font-khmer"
                >
                  ជ្រើសទាំងអស់
                </button>
                <span className="text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, selectedSubtitles: [] })}
                  className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 font-khmer"
                >
                  ដកការជ្រើសទាំងអស់
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
            <label className="text-[11px] font-semibold text-slate-300 font-khmer">
              សរសេរគោលដៅបន្ថែមដោយផ្ទាល់ (Optional custom focus)
            </label>
            <textarea
              value={formData.customSessionFocus || ''}
              onChange={(event) =>
                setFormData({ ...formData, customSessionFocus: event.target.value })
              }
              rows={2}
              placeholder="ឧទាហរណ៍៖ ផ្តោតលើការគណនាល្បឿនពីឧទាហរណ៍ទំព័រ ២៤–២៥ និងមិនទាន់បង្រៀនវ៉ិចទ័រល្បឿន។"
              className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-khmer"
            />
          </div>
        </div>

        {/* Duration Mins */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 font-khmer flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            រយៈពេលបង្រៀន (Duration):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[50, 60, 75, 90, 100].map((mins) => (
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
            <label className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-[10px] text-slate-500 font-khmer">
              ផ្សេងទៀត (50–100)
              <input
                type="number"
                min="50"
                max="100"
                value={formData.durationMins}
                onChange={(event) =>
                  setFormData({ ...formData, durationMins: event.target.value })
                }
                onBlur={() =>
                  setFormData({
                    ...formData,
                    durationMins: Math.min(100, Math.max(50, Number(formData.durationMins) || 50)),
                  })
                }
                className="mt-0.5 w-full bg-transparent text-xs font-bold text-slate-200 outline-none"
              />
            </label>
          </div>
          {!durationIsValid && (
            <p className="text-[10px] text-rose-300 font-khmer">រយៈពេលសម័យបង្រៀនត្រូវចន្លោះពី 50 ដល់ 100 នាទី។</p>
          )}
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

      <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-3">
        <div className="flex items-start gap-3">
          <Presentation className="w-5 h-5 text-purple-300 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-purple-200 font-khmer">
              ទម្រង់កិច្ចតែងការសាលាហេបភីច័ន្ទតារានារីព្រែកថ្មី
            </p>
            <p className="text-[11px] text-slate-400 font-khmer leading-relaxed">
              ប្រើរចនាសម្ព័ន្ធព័ត៌មានទូទៅ វត្ថុបំណង ៣ សម្បទា សម្ភារឧបទេស តារាងសកម្មភាព និងសន្លឹកកិច្ចការដាច់ដោយឡែក។
            </p>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-khmer">
            <span className="text-slate-300">សន្លឹកកិច្ចការសិស្ស</span>
            <span className="text-emerald-300 font-bold">រួមបញ្ចូលជានិច្ច</span>
          </div>
          <label className="flex items-center justify-between gap-3 cursor-pointer text-[11px] font-khmer">
            <span className="text-slate-300">ភ្ជាប់គម្រោងស្លាយជំនួយបង្រៀន</span>
            <input
              type="checkbox"
              checked={formData.includeSlides !== false}
              onChange={(event) =>
                setFormData({ ...formData, includeSlides: event.target.checked })
              }
              className="accent-purple-500"
            />
          </label>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.allowOpenEnrichment !== false}
            onChange={(event) =>
              setFormData({ ...formData, allowOpenEnrichment: event.target.checked })
            }
            className="mt-1 accent-cyan-500"
          />
          <span className="space-y-1">
            <span className="text-xs font-bold text-cyan-300 font-khmer flex items-center gap-1.5">
              <Globe2 className="w-4 h-4" /> ប្រើធនធានអប់រំបើកចំហសម្រាប់ពង្រឹងមេរៀន
            </span>
            <span className="block text-[11px] text-slate-400 font-khmer leading-relaxed">
              សៀវភៅ MoEYS កំណត់វិសាលភាពកម្មវិធីសិក្សា ខណៈធនធានបើកចំហផ្តល់គំនិតសកម្មភាព និងការពន្យល់បន្ថែម។
            </span>
          </span>
        </label>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-khmer">
          <span className="text-slate-500">ប្រភពដែលគ្រូបានជ្រើសដោយផ្ទាល់</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-950 text-amber-300 border border-slate-800">
            {selectedResourceCount > 0 ? `${selectedResourceCount} ប្រភព` : 'ប្រព័ន្ធនឹងណែនាំប្រភពសមស្រប'}
          </span>
        </div>
      </div>

      {/* Generate AI Button */}
      <div className="pt-2">
        <button
          onClick={onGenerate}
          disabled={generationDisabled}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-xl ${
            isGenerating
              ? 'bg-cyan-800 text-slate-300 cursor-not-allowed opacity-80'
              : generationDisabled
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
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
