import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coins,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function MockTests() {
  const { updateCoinBalance } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Test State
  const [activeTest, setActiveTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const res = await api.get('/tests');
      setTests(res.data?.tests || []);
    } catch (err) {
      console.error('Failed to load mock tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (testId) => {
    setLoading(true);
    try {
      const res = await api.get(`/tests/${testId}`);
      setActiveTest(res.data.test);
      setQuestions(res.data.questions || []);
      setCurrentQIndex(0);
      setSelectedAnswers({});
      setTestResult(null);

      const durationSec = (res.data.test.duration_minutes || 15) * 60;
      setTimeLeft(durationSec);
      startTimeRef.current = Date.now();
    } catch (err) {
      console.error('Failed to start test:', err);
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (activeTest && timeLeft > 0 && !testResult) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(true); // Auto-submit on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeTest, testResult]);

  const handleSelectOption = (optionKey) => {
    const qId = questions[currentQIndex].id;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionKey
    }));
  };

  const handleSubmit = async (auto = false) => {
    if (submitting || !activeTest) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    const timeTaken = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    try {
      const res = await api.post(`/tests/${activeTest.id}/submit`, {
        answers: selectedAnswers,
        time_taken_seconds: timeTaken
      });

      setTestResult(res.data);
      if (res.data?.newBalance !== undefined) {
        updateCoinBalance(res.data.newBalance);
      }

      if (res.data?.score >= 80) {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Submit test error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const exitTestMode = () => {
    setActiveTest(null);
    setTestResult(null);
    loadTests();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <Loader text="Loading mock assessments..." />;
  }

  // 1. Result Review View
  if (testResult) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Score Banner */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-2">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">Sprint Assessment Completed!</h2>

          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <span className="text-4xl font-extrabold text-indigo-600">{testResult.score}%</span>
              <p className="text-xs text-slate-400 mt-0.5">Overall Score</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-200" />
            <div className="text-center">
              <span className="text-4xl font-extrabold text-slate-800">
                {testResult.correctCount} / {testResult.totalQuestions}
              </span>
              <p className="text-xs text-slate-400 mt-0.5">Correct Answers</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-200" />
            <div className="text-center">
              <span className="text-4xl font-extrabold text-amber-600">+{testResult.coinsEarned}</span>
              <p className="text-xs text-slate-400 mt-0.5">Coins Rewarded</p>
            </div>
          </div>

          {testResult.score >= 80 ? (
            <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 py-2 px-4 rounded-xl border border-emerald-200 inline-block">
              🌟 Academic Distinction: Scored ≥80%! 50 bonus coins added to your balance.
            </p>
          ) : (
            <p className="text-xs font-semibold text-amber-700 bg-amber-50 py-2 px-4 rounded-xl border border-amber-200 inline-block">
              Keep practicing! Score 80% or higher to unlock 50 bonus reward coins.
            </p>
          )}

          <div className="pt-2">
            <button
              onClick={exitTestMode}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
            >
              Back to Assessments
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Detailed Answer Review</h3>
          {testResult.review?.map((q, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-white border shadow-sm space-y-3 ${
                q.is_correct ? 'border-emerald-200' : 'border-rose-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-bold text-slate-800">
                  Question {idx + 1}: {q.question}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center space-x-1 ${
                    q.is_correct ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {q.is_correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>{q.is_correct ? 'Correct' : 'Incorrect'}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {['A', 'B', 'C', 'D'].map((optKey) => {
                  const optText = q[`option_${optKey.toLowerCase()}`];
                  const isCorrect = q.correct_option === optKey;
                  const isChosen = q.student_choice === optKey;

                  return (
                    <div
                      key={optKey}
                      className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : isChosen
                          ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-bold text-[10px] border">
                        {optKey}
                      </span>
                      <span>{optText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Taking Active Test View
  if (activeTest && questions.length > 0) {
    const curQ = questions[currentQIndex];
    const isAnswered = selectedAnswers[curQ.id] !== undefined;
    const answeredCount = Object.keys(selectedAnswers).length;

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Test Header with Sticky Timer */}
        <div className="sticky top-16 z-20 bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">{activeTest.title}</h3>
            <p className="text-xs text-slate-500">
              Question {currentQIndex + 1} of {questions.length} · {answeredCount} answered
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Timer Badge */}
            <div
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl font-mono text-sm font-bold border ${
                timeLeft < 120
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>

        {/* Question Palette Indicator */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-1.5">
          {questions.map((q, idx) => {
            const answered = selectedAnswers[q.id] !== undefined;
            const current = idx === currentQIndex;
            return (
              <button
                key={idx}
                onClick={() => setCurrentQIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                  current
                    ? 'ring-2 ring-indigo-600 bg-indigo-600 text-white'
                    : answered
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Question Box */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
              Question {currentQIndex + 1}
            </span>
            <h4 className="text-lg font-bold text-slate-900 leading-snug">
              {curQ.question}
            </h4>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((optKey) => {
              const optText = curQ[`option_${optKey.toLowerCase()}`];
              const isSelected = selectedAnswers[curQ.id] === optKey;

              return (
                <button
                  key={optKey}
                  onClick={() => handleSelectOption(optKey)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center space-x-3.5 ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 text-indigo-900'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {optKey}
                  </span>
                  <span className="text-xs sm:text-sm font-medium">{optText}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Pagination */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
              disabled={currentQIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentQIndex((i) => Math.min(questions.length - 1, i + 1))}
              disabled={currentQIndex === questions.length - 1}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40"
            >
              Next Question
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Test Selection List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Sprint Mock Assessments</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Timed MCQs
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Challenge yourself with timed multiple choice exams. Earn +10 coins on completion and +50 coins for scores ≥ 80%!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tests.map((test) => (
          <div
            key={test.id}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-indigo-600">{test.course_title || 'General Curriculum'}</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{test.duration_minutes} Mins</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {test.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {test.question_count} comprehensive multiple-choice questions with real-time countdown timer.
              </p>

              {test.highest_score !== null && (
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Your Best Score:</span>
                  <span className="font-black text-indigo-700">{test.highest_score}%</span>
                </div>
              )}
            </div>

            <button
              onClick={() => startTest(test.id)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center space-x-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{test.highest_score !== null ? 'Retake Assessment' : 'Start Mock Test'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MockTests;
