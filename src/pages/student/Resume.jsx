import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import {
  Sparkles,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Code2,
  TrendingUp,
  RefreshCw,
  Layout,
  Target,
  Wand2,
  Check,
  Award,
  BookOpen
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import confetti from 'canvas-confetti';

const TARGET_ROLES = [
  'Full Stack Engineer',
  'Web Developer',
  'Data Analyst',
  'Machine Learning Engineer',
  'Cloud/DevOps Engineer',
  'Java Developer',
  'Cyber Security Analyst'
];

export function Resume() {
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState(null);
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [improving, setImproving] = useState(false);
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [template, setTemplate] = useState('modern'); // 'modern' | 'classic'
  const [toastMsg, setToastMsg] = useState('');

  // Form states pre-filled
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    skills: user?.skills || 'React, Node.js, JavaScript, Python, SQL, Git, REST APIs',
    interests: user?.interests || 'Full Stack Web Development, Cloud Computing'
  });

  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await api.get('/ai/resume');
        if (res.data?.resume) {
          setResumeData(res.data.resume);
          if (res.data.resume.target_role) {
            setTargetRole(res.data.resume.target_role);
          }
          if (res.data.resume.template) {
            setTemplate(res.data.resume.template);
          }
          await triggerAtsScore(res.data.resume, res.data.resume.target_role || targetRole);
        } else {
          // Pre-generate initial
          await handleGenerate();
        }
      } catch (err) {
        console.error('Failed to load saved resume:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSaved();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/ai/resume', {
        ...formData,
        targetRole,
        template
      });
      setResumeData(res.data?.resume);
      await triggerAtsScore(res.data?.resume, targetRole);
      showToast('Resume profile successfully generated!');
    } catch (err) {
      console.error('Failed to generate resume:', err);
    } finally {
      setGenerating(false);
    }
  };

  const triggerAtsScore = async (dataToScore, role) => {
    try {
      const res = await api.post('/ai/ats-score', {
        resumeData: dataToScore || resumeData,
        targetRole: role || targetRole
      });
      setAtsAnalysis(res.data);
    } catch (err) {
      console.error('Failed to analyze ATS score:', err);
    }
  };

  const handleImproveWithAI = async () => {
    if (!resumeData) return;
    setImproving(true);
    try {
      const res = await api.post('/ai/resume/improve', {
        resumeData,
        targetRole,
        template
      });

      if (res.data?.resume) {
        setResumeData(res.data.resume);
        if (res.data?.atsAnalysis) {
          setAtsAnalysis(res.data.atsAnalysis);
        } else {
          await triggerAtsScore(res.data.resume, targetRole);
        }
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        showToast(`✨ Resume enhanced with role keywords, metrics & action verbs for ${targetRole}!`);
      }
    } catch (err) {
      console.error('Failed to improve resume:', err);
    } finally {
      setImproving(false);
    }
  };

  const handleRoleChange = async (newRole) => {
    setTargetRole(newRole);
    if (resumeData) {
      await triggerAtsScore(resumeData, newRole);
    }
  };

  if (loading) {
    return <Loader text="Loading your AI resume profile and ATS scoring engine..." />;
  }

  // Transform ATS breakdown for Recharts
  const chartData = atsAnalysis?.breakdown
    ? [
        { name: 'Action Verbs', score: atsAnalysis.breakdown.actionVerbs || 75 },
        { name: 'Metrics', score: atsAnalysis.breakdown.quantifiableMetrics || 70 },
        { name: 'Role Keywords', score: atsAnalysis.breakdown.roleKeywords || 80 },
        { name: 'Formatting', score: atsAnalysis.breakdown.formattingStructure || 90 }
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-indigo-900 text-white shadow-xl border border-indigo-700 flex items-center space-x-2 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>AI Resume Builder & ATS Scorer</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              ATS Optimized
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tailor your resume to specific tech job descriptions, rewrite bullets with metrics, and score ATS readiness
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleImproveWithAI}
            disabled={improving || !resumeData}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold transition shadow-sm flex items-center space-x-2 disabled:opacity-50"
          >
            <Wand2 className={`w-3.5 h-3.5 ${improving ? 'animate-spin' : ''}`} />
            <span>{improving ? 'Optimizing with AI...' : 'Improve with AI'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm flex items-center space-x-2"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Configuration Strip: Target Role + Template Selector */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        {/* Role Selector */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Target Role:</span>
          </div>
          <select
            value={targetRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {TARGET_ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Template Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500">Design Template:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTemplate('modern')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                template === 'modern' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Modern Tech
            </button>
            <button
              onClick={() => setTemplate('classic')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                template === 'classic' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Classic Academic
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: ATS Analysis (5 cols) + Live Resume Preview (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6 no-print">
          {/* ATS Analysis Card */}
          {atsAnalysis && (
            <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-bold text-slate-900">ATS Readiness Score</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Role: <strong className="text-slate-700">{targetRole}</strong></p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black border ${
                  atsAnalysis.score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}>
                  <span className="text-2xl leading-none">{atsAnalysis.score}</span>
                  <span className="text-[9px] uppercase font-bold tracking-tighter">/ 100</span>
                </div>
              </div>

              {/* Recharts Bar Chart Breakdown */}
              {chartData.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category Breakdown</p>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '11px',
                            border: 'none'
                          }}
                        />
                        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.score >= 80 ? '#10b981' : entry.score >= 60 ? '#6366f1' : '#f59e0b'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Missing Keywords Section */}
              {atsAnalysis.missingKeywords && atsAnalysis.missingKeywords.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Recommended Keywords for {targetRole}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {atsAnalysis.missingKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-[11px] font-semibold"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-amber-700">
                    Click "Improve with AI" to automatically weave these skills into your experience bullets!
                  </p>
                </div>
              )}

              {/* Strengths & Improvement Tips */}
              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Detected Strengths</span>
                  </h4>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                    {atsAnalysis.strengths?.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 mb-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Actionable Recommendations</span>
                  </h4>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                    {atsAnalysis.improvementTips?.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Student Profile Parameters Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Custom Resume Parameters</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department & Major</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Technical Skills</label>
                <textarea
                  rows={2}
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interests & Specializations</label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Rebuilding...' : 'Regenerate Draft with New Details'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Formatted Resume Preview (7 cols) */}
        <div className="lg:col-span-7">
          {resumeData ? (
            template === 'modern' ? (
              /* MODERN TEMPLATE */
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-md space-y-6 text-slate-800 print-container">
                {/* Header */}
                <div className="border-b border-indigo-100 pb-5 text-center sm:text-left flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                      {resumeData.fullName}
                    </h1>
                    <p className="text-xs font-bold text-indigo-600 mt-0.5">
                      {targetRole}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 space-x-2">
                    <span>{resumeData.email}</span>
                    <span>•</span>
                    <span>{resumeData.phone}</span>
                    <span>•</span>
                    <span>{resumeData.location}</span>
                  </p>
                </div>

                {/* Summary */}
                {resumeData.summary && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-1">
                      Professional Summary
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{resumeData.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-1">
                      Technical Skills & Tooling
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(Array.isArray(resumeData.skills) ? resumeData.skills : resumeData.skills.split(',')).map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-100">
                          {typeof s === 'string' ? s.trim() : s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData.education && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-1">
                      Education
                    </h3>
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx} className="flex justify-between items-baseline text-xs">
                        <div>
                          <strong className="text-slate-900">{edu.institution}</strong>
                          <p className="text-slate-600">{edu.degree}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 font-semibold">{edu.year}</span>
                          {edu.gpa && <p className="font-semibold text-slate-700">GPA: {edu.gpa}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Experience */}
                {resumeData.experience && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-1">
                      Work & Project Experience
                    </h3>
                    {resumeData.experience.map((exp, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between items-baseline">
                          <strong className="text-slate-900 font-bold">{exp.role} · <span className="font-semibold text-slate-600">{exp.company}</span></strong>
                          <span className="text-slate-500 font-medium">{exp.period}</span>
                        </div>
                        <ul className="list-disc list-inside text-slate-600 space-y-1 pl-1">
                          {exp.bullets?.map((b, bIdx) => (
                            <li key={bIdx} className="leading-relaxed">{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-1">
                      Key Technical Projects
                    </h3>
                    {resumeData.projects.map((proj, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between items-baseline">
                          <strong className="text-slate-900 font-bold">{proj.title}</strong>
                          <span className="text-[11px] font-mono text-indigo-600 font-semibold">{proj.technologies}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* CLASSIC RECRUITER TEMPLATE */
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-300 shadow-md space-y-6 font-serif text-slate-900 print-container">
                {/* Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                  <h1 className="text-3xl font-black uppercase tracking-wider text-slate-900">
                    {resumeData.fullName}
                  </h1>
                  <p className="text-xs italic text-slate-700">Target Role: {targetRole}</p>
                  <p className="text-xs text-slate-600 space-x-2">
                    <span>{resumeData.email}</span>
                    <span>|</span>
                    <span>{resumeData.phone}</span>
                    <span>|</span>
                    <span>{resumeData.location}</span>
                  </p>
                </div>

                {/* Summary */}
                {resumeData.summary && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 font-sans">
                      Executive Summary
                    </h3>
                    <p className="text-xs text-slate-800 leading-relaxed font-sans">{resumeData.summary}</p>
                  </div>
                )}

                {/* Education */}
                {resumeData.education && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 font-sans">
                      Education
                    </h3>
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx} className="flex justify-between items-baseline text-xs font-sans">
                        <div>
                          <strong>{edu.institution}</strong> — {edu.degree}
                        </div>
                        <div>{edu.year}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Experience */}
                {resumeData.experience && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 font-sans">
                      Professional Experience
                    </h3>
                    {resumeData.experience.map((exp, idx) => (
                      <div key={idx} className="space-y-1 text-xs font-sans">
                        <div className="flex justify-between font-bold">
                          <span>{exp.role}, {exp.company}</span>
                          <span>{exp.period}</span>
                        </div>
                        <ul className="list-disc list-inside text-slate-800 space-y-0.5 pl-2 text-[11px]">
                          {exp.bullets?.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 font-sans">
                      Technical Projects
                    </h3>
                    {resumeData.projects.map((proj, idx) => (
                      <div key={idx} className="text-xs font-sans space-y-0.5">
                        <div className="flex justify-between font-bold">
                          <span>{proj.title}</span>
                          <span className="italic font-normal text-slate-600">{proj.technologies}</span>
                        </div>
                        <p className="text-[11px] text-slate-800">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 font-sans">
                      Technical Skills
                    </h3>
                    <p className="text-xs font-sans text-slate-800">
                      {Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') : resumeData.skills}
                    </p>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <p className="text-xs text-slate-500">Generating live preview...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Resume;
