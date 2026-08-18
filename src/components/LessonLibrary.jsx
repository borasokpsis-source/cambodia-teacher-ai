import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CopyPlus,
  Library,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const STATUS_STYLE = {
  draft: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  published: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
};

function statusLabel(status) {
  return status === 'published' ? 'បានផ្សព្វផ្សាយ' : 'សេចក្តីព្រាង';
}

export default function LessonLibrary({ plans, onOpen, onRemix, onCreateNew }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPlans = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return plans.filter((plan) => {
      const status = plan.publication?.status || 'draft';
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const searchable = [
        plan.metadata?.topic,
        plan.metadata?.parentLesson,
        plan.metadata?.sessionScope,
        ...(plan.metadata?.selectedSubtitles || []),
        plan.metadata?.subjectKm,
        plan.metadata?.subjectEn,
        plan.metadata?.teacherName,
        plan.metadata?.grade,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [plans, query, statusFilter]);

  const publishedCount = plans.filter((plan) => plan.publication?.status === 'published').length;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-300">
              <Library className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Teacher lesson library</span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 font-khmer">
              បណ្ណាល័យកិច្ចតែងការរបស់គ្រូ
            </h2>
            <p className="text-sm text-slate-400 font-khmer max-w-2xl">
              ស្វែងរក បើក កែសម្រួល និងចម្លងបន្តកិច្ចតែងការ។ ទិន្នន័យជំនាន់នេះរក្សាទុកក្នុង browser របស់អ្នក។
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <p className="text-2xl font-black text-cyan-300">{plans.length}</p>
              <p className="text-[10px] text-slate-400 font-khmer">កិច្ចតែងការសរុប</p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <p className="text-2xl font-black text-emerald-300">{publishedCount}</p>
              <p className="text-[10px] text-slate-400 font-khmer">បានផ្សព្វផ្សាយ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3">
        <label className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ស្វែងរកតាមប្រធានបទ មុខវិជ្ជា ថ្នាក់ ឬឈ្មោះគ្រូ..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none text-sm text-slate-100 font-khmer"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-khmer outline-none"
        >
          <option value="all">ស្ថានភាពទាំងអស់</option>
          <option value="draft">សេចក្តីព្រាង</option>
          <option value="published">បានផ្សព្វផ្សាយ</option>
        </select>
      </div>

      {filteredPlans.length === 0 ? (
        <div className="glass-panel p-10 rounded-3xl border border-dashed border-slate-700 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 font-khmer">មិនទាន់មានកិច្ចតែងការនៅក្នុងបណ្ណាល័យ</h3>
            <p className="text-xs text-slate-500 font-khmer mt-1">បង្កើតកិច្ចតែងការមួយ រួចរក្សាទុកជាសេចក្តីព្រាង ឬផ្សព្វផ្សាយ។</p>
          </div>
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold font-khmer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> បង្កើតកិច្ចតែងការថ្មី
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPlans.map((plan) => {
            const status = plan.publication?.status || 'draft';
            const qualityScore = plan.qualityReport?.score;
            return (
              <article
                key={plan.metadata?.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                      {plan.metadata?.subjectKm} · {plan.metadata?.grade}
                    </p>
                    <h3 className="font-bold text-base text-slate-100 font-khmer mt-1 line-clamp-2">
                      {plan.metadata?.topic}
                    </h3>
                    {plan.metadata?.isSessionScoped && (
                      <p className="mt-1 text-[10px] text-slate-500 font-khmer line-clamp-1">
                        មេរៀនមេ៖ {plan.metadata?.parentLesson}
                      </p>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold font-khmer shrink-0 ${STATUS_STYLE[status]}`}>
                    {statusLabel(status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-slate-500 font-khmer">អ្នកនិពន្ធ</p>
                    <p className="text-slate-200 font-khmer truncate">{plan.publication?.author || plan.metadata?.teacherName}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-slate-500 font-khmer">អាជ្ញាបណ្ណ</p>
                    <p className="text-slate-200 truncate">{plan.publication?.license || 'CC BY 4.0'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
                    <p className="text-slate-500 font-khmer">គុណភាពស្វ័យប្រវត្តិ</p>
                    <p className="text-emerald-300 font-bold">{qualityScore ?? '—'}/100</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-khmer">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {plan.publication?.reviewStatus === 'unreviewed'
                      ? 'មិនទាន់បានអ្នកជំនាញពិនិត្យ'
                      : plan.publication?.reviewStatus}
                  </span>
                </div>

                <div className="flex gap-2 pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => onOpen(plan)}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold font-khmer hover:bg-cyan-400 transition-colors"
                  >
                    បើកមើល
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemix(plan)}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold font-khmer hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5"
                  >
                    <CopyPlus className="w-3.5 h-3.5 text-cyan-400" /> ចម្លងកែ
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
