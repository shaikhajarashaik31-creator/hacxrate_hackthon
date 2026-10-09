import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import {
  Code2,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  Flame,
  Award,
  ChevronRight,
  RotateCcw,
  Sparkles,
  BarChart3,
  Search,
  Filter,
  Clock,
  Layers,
  Coins
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export function PracticeArena() {
  const { user, updateCoinBalance } = useAuth();

  const [problems, setProblems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [problemDetails, setProblemDetails] = useState(null);

  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [overallStatus, setOverallStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'submissions' | 'hints'

  const [hintText, setHintText] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [toastReward, setToastReward] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load problem list and student stats
  const loadArenaData = async () => {
    try {
      const [probRes, statsRes] = await Promise.all([
        api.get('/practice/problems', {
          params: {
            difficulty: difficultyFilter,
            topic: topicFilter,
            search: searchQuery
          }
        }),
        api.get('/practice/stats')
      ]);

      setProblems(probRes.data.problems || []);
      setTopics(probRes.data.topics || []);
      setStats(statsRes.data);

      // Select first problem by default if none selected
      if (!selectedProblem && probRes.data.problems?.length > 0) {
        selectProblem(probRes.data.problems[0]);
      }
    } catch (err) {
      console.error('Failed to load practice problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArenaData();
  }, [difficultyFilter, topicFilter, searchQuery]);

  // Select problem and fetch details + starter code
  const selectProblem = async (prob) => {
    setSelectedProblem(prob);
    setTestResults(null);
    setOverallStatus(null);
    setHintText(null);
    setExplanation(null);
    setActiveTab('description');

    try {
      const res = await api.get(`/practice/problems/${prob.id}`);
      setProblemDetails(res.data);
      const starter = res.data.problem?.starterCode?.[language] ||
        (language === 'python' ? 'class Solution:\n    # Write your solution here\n    pass\n' : 'function solution() {\n  // Write code\n}\n');
      setCode(starter);
    } catch (err) {
      console.error('Failed to load problem details:', err);
    }
  };

  // Switch code starter when language changes
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problemDetails?.problem?.starterCode?.[newLang]) {
      setCode(problemDetails.problem.starterCode[newLang]);
    } else if (newLang === 'python') {
      setCode('class Solution:\n    # Solution\n    pass\n');
    } else if (newLang === 'javascript') {
      setCode('function solution() {\n  // Code\n}\n');
    } else if (newLang === 'java') {
      setCode('class Solution {\n    public void solve() {\n        // Code\n    }\n}\n');
    } else if (newLang === 'cpp') {
      setCode('#include <iostream>\nusing namespace std;\nclass Solution {\npublic:\n};\n');
    }
  };

  // Run visible sample test cases
  const handleRunSample = async () => {
    if (!selectedProblem || running) return;
    setRunning(true);
    setOverallStatus(null);

    try {
      const res = await api.get(`/practice/problems/${selectedProblem.id}`);
      const runRes = await api.post(`/practice/problems/${selectedProblem.id}/run`, {
        language,
        code
      });

      setTestResults(runRes.data.results || []);
      setOverallStatus({
        status: runRes.data.status,
        allPassed: runRes.data.allPassed,
        runtimeMs: runRes.data.runtimeMs,
        isSample: true
      });
    } catch (err) {
      setOverallStatus({
        status: 'Runtime Error',
        allPassed: false,
        error: err.response?.data?.error || err.message,
        isSample: true
      });
    } finally {
      setRunning(false);
    }
  };

  // Submit against hidden test cases
  const handleSubmit = async () => {
    if (!selectedProblem || submitting) return;
    setSubmitting(true);
    setOverallStatus(null);

    try {
      const res = await api.post(`/practice/problems/${selectedProblem.id}/submit`, {
        language,
        code
      });

      setTestResults(res.data.testResults || []);
      setOverallStatus({
        status: res.data.status,
        allPassed: res.data.isAccepted,
        runtimeMs: res.data.runtimeMs,
        passed: res.data.passed,
        total: res.data.total,
        isSample: false
      });

      // Award coins celebration
      if (res.data.isAccepted && res.data.coinsAwarded > 0) {
        updateCoinBalance(res.data.newBalance);
        setToastReward(`+${res.data.coinsAwarded} Coins Earned! First solve on ${selectedProblem.title}`);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => setToastReward(null), 5000);
      }

      // Refresh list & stats
      loadArenaData();
    } catch (err) {
      setOverallStatus({
        status: 'Evaluation Error',
        allPassed: false,
        error: err.response?.data?.error || err.message,
        isSample: false
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Get Hint from AI Mentor
  const handleGetHint = async () => {
    if (!selectedProblem) return;
    try {
      const res = await api.get(`/practice/problems/${selectedProblem.id}/hint`);
      setHintText(res.data.hints);
      setActiveTab('hints');
    } catch (err) {
      console.error('Failed to get hint:', err);
    }
  };

  // Request Solution Explanation
  const handleExplain = async () => {
    if (!selectedProblem) return;
    try {
      const res = await api.get(`/practice/problems/${selectedProblem.id}/explain`);
      setExplanation(res.data);
      setShowExplainModal(true);
    } catch (err) {
      alert(err.response?.data?.error || 'You must attempt or solve this problem before viewing the solution explanation.');
    }
  };

  if (loading && !problems.length) {
    return <Loader text="Loading Coding Practice Arena..." />;
  }

  const prob = problemDetails?.problem || selectedProblem;

  const difficultyColors = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Hard: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="space-y-6">
      {/* Coin Reward Banner Animation */}
      {toastReward && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-extrabold px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-bounce">
          <Coins className="w-6 h-6 text-yellow-200" />
          <span>{toastReward}</span>
        </div>
      )}

      {/* Top Telemetry & Streak Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
              Practice Arena <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">40+ Curated Problems</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Solve problems to automatically earn coins: <span className="text-emerald-600 font-bold">+10 Easy</span>, <span className="text-amber-600 font-bold">+25 Medium</span>, <span className="text-rose-600 font-bold">+50 Hard</span>. Updates performance dynamically.
          </p>
        </div>

        {/* Stats Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
              {stats?.totalSolved || 0}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Solved</p>
              <p className="font-bold text-slate-700">{stats?.totalSolved || 0} / {stats?.totalProblems || 40}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-700">Practice Streak</p>
              <p className="font-bold text-amber-900">{stats?.currentStreak || 0} Days Active</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-700">Difficulty Solved</p>
              <p className="font-bold text-emerald-900">
                E: {stats?.difficulty?.Easy?.solved || 0} | M: {stats?.difficulty?.Medium?.solved || 0} | H: {stats?.difficulty?.Hard?.solved || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Problem Selector Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by title or topic..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  difficultyFilter === diff
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Topic Dropdown */}
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none"
          >
            <option value="All">All Topics ({topics.length})</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split-Screen Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Browser & Statement (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Problem Selector Carousel / Pills */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 px-1">
              Select Problem ({problems.length} Available)
            </p>
            <div className="flex space-x-2 overflow-x-auto pb-1 max-h-36 scrollbar-thin">
              {problems.map((p) => {
                const isCurrent = selectedProblem?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => selectProblem(p)}
                    className={`flex-shrink-0 text-left p-2.5 rounded-xl border text-xs transition ${
                      isCurrent
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                      {p.isSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      <span className="truncate max-w-[120px]">{p.title}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1 text-[10px]">
                      <span className={`px-1.5 py-0.2 rounded font-semibold ${difficultyColors[p.difficulty]}`}>
                        {p.difficulty}
                      </span>
                      <span className="text-slate-400 truncate max-w-[90px]">{p.topic}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem Details Card */}
          {prob && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5">
              {/* Problem Title & Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{prob.title}</h2>
                    {prob.isSolved && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Solved</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1.5 text-xs">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${difficultyColors[prob.difficulty]}`}>
                      {prob.difficulty}
                    </span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-slate-600 font-semibold">{prob.topic}</span>
                  </div>
                </div>

                {/* Hint & Explain Action Buttons */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={handleGetHint}
                    className="p-2 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition text-xs font-semibold flex items-center space-x-1"
                    title="Get Hint from AI Mentor"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span className="hidden sm:inline">Hint</span>
                  </button>
                  <button
                    onClick={handleExplain}
                    className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition text-xs font-semibold flex items-center space-x-1"
                    title="Explain solution (Available after attempt)"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span className="hidden sm:inline">Explain</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center space-x-4 border-b border-slate-100 text-xs">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-2.5 font-bold transition ${
                    activeTab === 'description' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Statement
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`pb-2.5 font-bold transition ${
                    activeTab === 'submissions' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Submissions ({problemDetails?.pastSubmissions?.length || 0})
                </button>
                {hintText && (
                  <button
                    onClick={() => setActiveTab('hints')}
                    className={`pb-2.5 font-bold transition ${
                      activeTab === 'hints' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Hints 💡
                  </button>
                )}
              </div>

              {/* Tab Content */}
              {activeTab === 'description' && (
                <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                  <p className="text-sm text-slate-800 font-medium whitespace-pre-line">{prob.description}</p>

                  {/* Examples */}
                  {prob.examples && prob.examples.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Examples:</h4>
                      {prob.examples.map((ex, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 font-mono text-[11px]">
                          <div><span className="text-slate-400">Input:</span> <span className="text-slate-900 font-semibold">{ex.input}</span></div>
                          <div><span className="text-slate-400">Output:</span> <span className="text-emerald-700 font-semibold">{ex.output}</span></div>
                          {ex.explanation && (
                            <div className="font-sans text-[11px] text-slate-500 pt-1 italic">
                              Explanation: {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Constraints */}
                  {prob.constraints && prob.constraints.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Constraints:</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 font-mono text-[11px]">
                        {prob.constraints.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'submissions' && (
                <div className="space-y-2 text-xs">
                  {problemDetails?.pastSubmissions?.length ? (
                    problemDetails.pastSubmissions.map((sub) => (
                      <div key={sub.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {sub.status === 'Accepted' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          )}
                          <span className="font-bold text-slate-800">{sub.status}</span>
                          <span className="text-slate-400 text-[10px]">({sub.language})</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {sub.passed}/{sub.total} passed &bull; {sub.runtime_ms}ms
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic py-4 text-center">No submissions yet for this problem.</p>
                  )}
                </div>
              )}

              {activeTab === 'hints' && hintText && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-900">
                  <h4 className="font-bold flex items-center space-x-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>AI Mentor Hints</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {hintText.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Topic Progress Bar Chart */}
          {stats?.topicProgress && stats.topicProgress.length > 0 && (
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Topic Mastery Breakdown</span>
              </h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topicProgress.slice(0, 6)} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="topic" type="category" width={90} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip />
                    <Bar dataKey="solved" fill="#4f46e5" radius={[0, 6, 6, 0]} name="Solved" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Monaco Code Editor & Results Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col">
            {/* Editor Top Bar */}
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 text-white font-bold">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span>Sandbox Editor</span>
                </div>
                {/* Language Picker */}
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-2.5 py-1 bg-slate-700 text-slate-200 rounded-lg border border-slate-600 focus:outline-none font-medium"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript (Node)</option>
                  <option value="java">Java 17</option>
                  <option value="cpp">C++ (g++)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const starter = problemDetails?.problem?.starterCode?.[language] || '';
                    if (starter) setCode(starter);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                  title="Reset to starter template"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleRunSample}
                  disabled={running || submitting}
                  className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold flex items-center space-x-1.5 transition disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{running ? 'Running...' : 'Run Samples'}</span>
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={running || submitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Evaluating...' : 'Submit Code'}</span>
                </button>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="h-[440px]">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : (language === 'python' ? 'python' : 'javascript')}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2
                }}
              />
            </div>
          </div>

          {/* Test Results Output Drawer */}
          {overallStatus && (
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  {overallStatus.allPassed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600" />
                  )}
                  <div>
                    <h3 className={`text-base font-black ${overallStatus.allPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {overallStatus.status}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {overallStatus.isSample ? 'Tested against visible sample cases' : `Evaluated against hidden test cases (${overallStatus.passed}/${overallStatus.total} passed)`}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <span className="font-mono bg-slate-100 px-2 py-1 rounded-lg">
                    ⚡ {overallStatus.runtimeMs}ms
                  </span>
                </div>
              </div>

              {/* Individual Case Breakdown */}
              {testResults && testResults.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Test Cases Breakdown:</p>
                  <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                    {testResults.map((tc, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex flex-col space-y-1 ${
                          tc.passed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-rose-50/50 border-rose-200 text-rose-950'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>Case #{idx + 1} {tc.isHidden ? '(Hidden)' : ''}</span>
                          <span className={tc.passed ? 'text-emerald-700' : 'text-rose-700'}>
                            {tc.passed ? 'PASSED ✓' : 'FAILED ✗'}
                          </span>
                        </div>
                        {!tc.isHidden && (
                          <div className="text-[11px] space-y-0.5 text-slate-700">
                            <div>Input: <span className="font-bold text-slate-900">{tc.input}</span></div>
                            <div>Expected: <span className="font-bold text-slate-900">{tc.expected}</span></div>
                            <div>Output: <span className="font-bold text-slate-900">{tc.actual}</span></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Explanation Modal */}
      {showExplainModal && explanation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-lg font-black text-slate-900">AI Solution Explanation</h3>
              </div>
              <button
                onClick={() => setShowExplainModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <h4 className="text-sm font-bold text-slate-900">{explanation.title}</h4>
              <p className="whitespace-pre-line text-sm">{explanation.explanation}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowExplainModal(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PracticeArena;
