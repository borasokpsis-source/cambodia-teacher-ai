import React, { useMemo, useState } from 'react';
import {
  Check,
  ExternalLink,
  Globe2,
  Link2,
  Plus,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { RESOURCE_LICENSE_OPTIONS, resourceMatchesSubject } from '../data/openEducationalResources';

const EMPTY_FORM = {
  title: '',
  organization: '',
  url: '',
  license: 'CC BY 4.0',
  notes: '',
};

export default function OpenResourceLibrary({
  resources,
  selectedSubjectId,
  selectedResourceIds,
  onToggleResource,
  onAddResource,
}) {
  const [query, setQuery] = useState('');
  const [subjectOnly, setSubjectOnly] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const selectedSet = useMemo(() => new Set(selectedResourceIds), [selectedResourceIds]);
  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesSubject = !subjectOnly || resourceMatchesSubject(resource, selectedSubjectId);
      const searchable = [
        resource.title,
        resource.organization,
        resource.descriptionKm,
        resource.notes,
        resource.license,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchesSubject && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [query, resources, selectedSubjectId, subjectOnly]);

  const submitResource = (event) => {
    event.preventDefault();
    setError('');
    try {
      const parsedUrl = new URL(form.url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Unsupported URL');
    } catch {
      setError('សូមបញ្ចូលតំណ http ឬ https ដែលត្រឹមត្រូវ។');
      return;
    }
    if (!form.title.trim()) {
      setError('សូមបញ្ចូលចំណងជើងធនធាន។');
      return;
    }
    onAddResource({
      ...form,
      title: form.title.trim(),
      organization: form.organization.trim() || 'Teacher contributed',
      descriptionKm: form.notes.trim(),
      usageNoteKm: 'ធនធានបន្ថែមដោយគ្រូ; ត្រូវពិនិត្យខ្លឹមសារ និងអាជ្ញាបណ្ណមុនផ្សព្វផ្សាយ។',
      licenseCode: form.license,
      subjects: [selectedSubjectId || 'all'],
      resourceTypes: ['teacher-contributed'],
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-cyan-300">
              <Globe2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Open enrichment library</span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 font-khmer">ធនធានអប់រំបើកចំហ</h2>
            <p className="text-sm text-slate-400 font-khmer">
              ជ្រើសប្រភពសម្រាប់ភ្ជាប់ជាមួយ curriculum anchor ឬបន្ថែមតំណរបស់គ្រូ។ KruAI រក្សាប្រភព អាជ្ញាបណ្ណ និងការប្រើប្រាស់ឱ្យអាចតាមដានបាន។
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold font-khmer inline-flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> បន្ថែមធនធាន
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200 font-khmer">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          “ឥតគិតថ្លៃ” មិនស្មើនឹង “អាចចម្លងបាន” ទេ។ ប្រព័ន្ធបង្ហាញតំណជាប្រភពណែនាំ ហើយមិនអះអាងថាបានអានទំព័រនោះទេ។ គ្រូត្រូវផ្ទៀងផ្ទាត់ខ្លឹមសារ និងអាជ្ញាបណ្ណមុនផ្សព្វផ្សាយ។
        </p>
      </div>

      {showForm && (
        <form onSubmit={submitResource} className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5 text-xs font-khmer text-slate-300">
              <span>ចំណងជើង *</span>
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none text-slate-100"
              />
            </label>
            <label className="space-y-1.5 text-xs font-khmer text-slate-300">
              <span>អង្គការ / អ្នកនិពន្ធ</span>
              <input
                value={form.organization}
                onChange={(event) => setForm({ ...form, organization: event.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none text-slate-100"
              />
            </label>
            <label className="space-y-1.5 text-xs font-khmer text-slate-300 md:col-span-2">
              <span>តំណ URL *</span>
              <input
                type="url"
                value={form.url}
                onChange={(event) => setForm({ ...form, url: event.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none text-slate-100"
              />
            </label>
            <label className="space-y-1.5 text-xs font-khmer text-slate-300">
              <span>អាជ្ញាបណ្ណ</span>
              <select
                value={form.license}
                onChange={(event) => setForm({ ...form, license: event.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 outline-none text-slate-100"
              >
                {RESOURCE_LICENSE_OPTIONS.map((license) => (
                  <option key={license} value={license}>{license}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-khmer text-slate-300 md:col-span-2">
              <span>កំណត់ចំណាំ ឬខ្លឹមសារដែលគ្រូចង់ប្រើ</span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none text-slate-100 resize-y"
              />
            </label>
          </div>
          {error && <p className="text-xs text-rose-300 font-khmer">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-khmer">បោះបង់</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold font-khmer">រក្សាទុកធនធាន</button>
          </div>
        </form>
      )}

      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center">
        <label className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ស្វែងរកធនធាន អង្គការ ឬអាជ្ញាបណ្ណ..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none text-sm text-slate-100 font-khmer"
          />
        </label>
        <label className="inline-flex items-center gap-2 text-xs text-slate-300 font-khmer cursor-pointer">
          <input
            type="checkbox"
            checked={subjectOnly}
            onChange={(event) => setSubjectOnly(event.target.checked)}
            className="accent-cyan-500"
          />
          បង្ហាញតែមុខវិជ្ជាដែលបានជ្រើស
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((resource) => {
          const selected = selectedSet.has(resource.id);
          return (
            <article key={resource.id} className={`glass-panel p-5 rounded-2xl border space-y-3 transition-all ${selected ? 'border-cyan-500/70 bg-cyan-500/5' : 'border-slate-800'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-100">{resource.title}</h3>
                  <p className="text-[11px] text-slate-500">{resource.organization}</p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[9px] text-amber-300 shrink-0">
                  {resource.license}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-khmer leading-relaxed">
                {resource.descriptionKm || resource.notes}
              </p>
              <p className="text-[10px] text-slate-500 font-khmer">{resource.usageNoteKm}</p>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => onToggleResource(resource.id)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold font-khmer inline-flex items-center justify-center gap-1.5 ${selected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}
                >
                  {selected ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  {selected ? 'បានជ្រើសសម្រាប់មេរៀន' : 'ប្រើជាប្រភពបន្ថែម'}
                </button>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 hover:bg-slate-700"
                  aria-label={`Open ${resource.title}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
