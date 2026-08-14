import React, { useState } from 'react';
import { GraduationCap, Sparkles, Sliders, Key, X, CheckCircle, BrainCircuit } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('kruai_gemini_key') || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }

  const handleSaveSettings = () => {
    localStorage.setItem('kruai_gemini_key', apiKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowSettings(false);
    }, 1500);
  };

  const handleTestKey = async () => {
    const keyToTest = apiKey.trim() || import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!keyToTest) {
      setTestResult({ success: false, message: 'សូមបញ្ចូល API Key ជាមុនសិន!' });
      return;
    }
    setIsTestingKey(true);
    setTestResult(null);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${keyToTest}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with OK.' }] }],
          }),
        }
      );

      if (res.ok) {
        setTestResult({ success: true, message: '✅ API Key ត្រឹមត្រូវ! ភ្ជាប់ទៅ Gemini 2.0 Flash ជោគជ័យ។' });
      } else {
        const data = await res.json().catch(() => ({}));
        const err = data.error?.message || `HTTP status ${res.status}`;
        setTestResult({ success: false, message: `❌ បរាជ័យក្នុងការភ្ជាប់៖ ${err}` });
      }
    } catch (e) {
      setTestResult({ success: false, message: `❌ បរាជ័យក្នុងការភ្ជាប់៖ ${e.message}` });
    } finally {
      setIsTestingKey(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-khmer font-black text-lg text-slate-100 tracking-tight">គ្រូ AI</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  KruAI v2.0 Smart
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-khmer hidden sm:block">
                ប្រព័ន្ធ AI បង្កើតកិច្ចតែងការបង្រៀន 5E • STEM • សៀវភៅពុម្ពផ្លូវការក្រសួង
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-2 rounded-xl text-xs font-khmer font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'generator'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>បង្កើតកិច្ចតែងការ</span>
            </button>

            {/* AI Engine Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all flex items-center gap-1.5 text-xs font-khmer"
              title="AI Engine Settings"
            >
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">ការកំណត់ AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* AI Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-md w-full space-y-5 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100 font-khmer">
                  ការកំណត់ AI Engine (Google Gemini API)
                </h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-khmer">
              <p className="text-slate-300 leading-relaxed">
                លោកគ្រូអ្នកគ្រូអាចយក <strong>Gemini Free API Key</strong> ពី Google AI Studio (aistudio.google.com) មកដាក់ដើម្បីទាញយក AI ជំនាន់ 2.0 Flash៖
              </p>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    Gemini API Key:
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    យក API Key ឥតគិតថ្លៃ ↗
                  </a>
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setTestResult(null);
                    }}
                    placeholder={import.meta.env.VITE_GEMINI_API_KEY ? 'ប្រើប្រាស់ System API Key (ឬដាក់ Key ផ្ទាល់ខ្លួន)...' : 'AIzaSy...'}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-slate-100 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTestKey}
                    disabled={isTestingKey}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold border border-slate-700 text-xs transition-all shrink-0"
                  >
                    {isTestingKey ? 'កំពុងតេស្ត...' : 'តេស្ត API'}
                  </button>
                </div>
                {import.meta.env.VITE_GEMINI_API_KEY && !apiKey && (
                  <p className="text-[10px] text-emerald-400 font-khmer flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> ប្រព័ន្ធបានភ្ជាប់ API Key មេជាស្រេចសម្រាប់អ្នកប្រើប្រាស់ទាំងអស់
                  </p>
                )}
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-[11px] font-khmer ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <p className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> ម៉ាស៊ីន AI ឆ្លាតវៃក្នុងស្រុក (Local Engine Fallback)
                </p>
                <p>ទោះបីជាគ្មាន API Key ឬ Quota ពេញ ក៏ KruAI អាចបង្កើតកិច្ចតែងការ 5E ត្រឹមត្រូវតាមប្រធានបទបាន 100%!</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-khmer font-semibold hover:bg-slate-700"
              >
                បោះបង់
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-khmer font-bold hover:bg-cyan-400 transition-all flex items-center gap-1.5"
              >
                {savedSuccess ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                <span>{savedSuccess ? 'បានរក្សាទុក!' : 'រក្សាទុក'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
