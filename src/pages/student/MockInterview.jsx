import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import {
  Mic,
  Bot,
  User,
  Sparkles,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Award,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function MockInterview() {
  const [interviewType, setInterviewType] = useState('technical'); // 'technical' | 'hr'
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [previousRounds, setPreviousRounds] = useState([]);
  const [currentEval, setCurrentEval] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    fetchQuestion(interviewType, 1, []);
  }, [interviewType]);

  const fetchQuestion = async (type, num, rounds) => {
    setLoadingQuestion(true);
    setCurrentEval(null);
    setStudentAnswer('');
    setShowHint(false);

    try {
      const res = await api.post('/ai/interview/question', {
        type,
        questionNumber: num,
        previousRounds: rounds
      });
      setCurrentQuestion(res.data?.question);
    } catch (err) {
      console.error('Failed to load interview question:', err);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!studentAnswer.trim() || evaluating) return;

    setEvaluating(true);
    try {
      const res = await api.post('/ai/interview/evaluate', {
        question: currentQuestion?.question,
        answer: studentAnswer,
        type: interviewType
      });

      setCurrentEval(res.data);
      const newRound = {
        questionNumber,
        question: currentQuestion?.question,
        answer: studentAnswer,
        evaluation: res.data
      };
      setPreviousRounds((prev) => [...prev, newRound]);
    } catch (err) {
      console.error('Failed to evaluate answer:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (questionNumber >= 5) {
      setCompleted(true);
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      const nextNum = questionNumber + 1;
      setQuestionNumber(nextNum);
      fetchQuestion(interviewType, nextNum, previousRounds);
    }
  };

  const resetInterview = (type = interviewType) => {
    setInterviewType(type);
    setQuestionNumber(1);
    setPreviousRounds([]);
    setCurrentEval(null);
    setCompleted(false);
    fetchQuestion(type, 1, []);
  };

  // Final Summary Report
  if (completed) {
    const totalScore = previousRounds.reduce((acc, r) => acc + (r.evaluation?.score || 7), 0);
    const avgScore = Math.round((totalScore / (previousRounds.length || 1)) * 10);

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">
            {interviewType.toUpperCase()} Interview Session Completed!
          </h2>

          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <span className="text-4xl font-extrabold text-indigo-600">{avgScore}%</span>
              <p className="text-xs text-slate-400 mt-0.5">Overall Readiness</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-200" />
            <div className="text-center">
              <span className="text-4xl font-extrabold text-emerald-600">{previousRounds.length}/5</span>
              <p className="text-xs text-slate-400 mt-0.5">Rounds Cleared</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            Great performance! You demonstrated clear logical reasoning and structured verbal formulation. Consistent practice with AI interview simulations dramatically boosts confidence during high-stakes hiring rounds.
          </p>

          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => resetInterview('technical')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
            >
              Practice Technical Round
            </button>
            <button
              onClick={() => resetInterview('hr')}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
            >
              Practice Behavioral / HR
            </button>
          </div>
        </div>

        {/* Breakdown of each round */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Round Breakdown & AI Feedback</h3>
          {previousRounds.map((r, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-800">
                  Question #{r.questionNumber}: {r.question}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700">
                  {r.evaluation?.score}/10
                </span>
              </div>
              <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                "{r.answer}"
              </p>
              <p className="text-xs text-emerald-700 font-medium">
                💡 Model Answer Strategy: {r.evaluation?.modelAnswerSummary}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>AI Mock Interview Simulator</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Round {questionNumber} of 5
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Simulate realistic 1-on-1 interviews with instant speech evaluation and scoring
          </p>
        </div>

        {/* Round Switcher Tabs */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => resetInterview('technical')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              interviewType === 'technical'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Technical Track
          </button>
          <button
            onClick={() => resetInterview('hr')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              interviewType === 'hr'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Behavioral / HR Track
          </button>
        </div>
      </div>

      {loadingQuestion ? (
        <Loader text="Generating interview question from AI mentor..." />
      ) : (
        currentQuestion && (
          <div className="space-y-6">
            {/* Interviewer Question Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-indigo-100 shadow-sm flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/20">
                <Bot className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                    Interviewer Question #{questionNumber}
                  </span>
                  {currentQuestion.hint && (
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs text-slate-400 hover:text-indigo-600 flex items-center space-x-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide Hint' : 'View Hint'}</span>
                    </button>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQuestion.question}
                </h3>

                {showHint && currentQuestion.hint && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 animate-in fade-in">
                    <strong>💡 Hint:</strong> {currentQuestion.hint}
                  </div>
                )}
              </div>
            </div>

            {/* Candidate Answer Box */}
            {!currentEval ? (
              <form onSubmit={handleAnswerSubmit} className="space-y-3">
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Your Response</span>
                    </span>
                    <span>{studentAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
                  </div>

                  <textarea
                    rows={6}
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    placeholder="Type or dictate your structured response here..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none leading-relaxed"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      Tip: Structure with STAR method (Situation, Task, Action, Result)
                    </span>
                    <button
                      type="submit"
                      disabled={!studentAnswer.trim() || evaluating}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{evaluating ? 'Analyzing Response...' : 'Submit Answer'}</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* AI Evaluation Card */
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-md space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">AI Evaluation Report</h4>
                      <p className="text-xs text-slate-500">Question #{questionNumber} Assessment</p>
                    </div>
                  </div>

                  <div className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-center">
                    <p className="text-[10px] uppercase font-bold text-indigo-600">Score</p>
                    <p className="text-xl font-black">{currentEval.score} / 10</p>
                  </div>
                </div>

                {/* Candidate's submitted text */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <strong className="text-slate-800">Your Answer:</strong> "{studentAnswer}"
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Strengths */}
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                    <h5 className="font-bold text-emerald-900 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Key Strengths</span>
                    </h5>
                    <ul className="space-y-1 text-emerald-800 list-disc list-inside text-[11px]">
                      {currentEval.strengths?.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
                    <h5 className="font-bold text-amber-900 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Areas for Improvement</span>
                    </h5>
                    <ul className="space-y-1 text-amber-800 list-disc list-inside text-[11px]">
                      {currentEval.areasForImprovement?.map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Model Answer Summary */}
                {currentEval.modelAnswerSummary && (
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs space-y-1">
                    <strong className="text-indigo-900 font-bold">Suggested Model Answer Paradigm:</strong>
                    <p className="text-indigo-800 leading-relaxed text-[11px]">
                      {currentEval.modelAnswerSummary}
                    </p>
                  </div>
                )}

                {/* Next button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
                  >
                    <span>{questionNumber >= 5 ? 'View Final Report' : 'Next Question'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

export default MockInterview;
