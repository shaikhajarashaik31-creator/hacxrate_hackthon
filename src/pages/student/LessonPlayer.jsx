import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  Printer,
  ShieldCheck,
  ExternalLink,
  ArrowLeft,
  PlayCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function LessonPlayer() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user, updateCoinBalance } = useAuth();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCourseLessons();
  }, [courseId]);

  const loadCourseLessons = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/courses/${courseId}/lessons`);
      setCourse(res.data?.course);
      const fetchedLessons = res.data?.lessons || [];
      setLessons(fetchedLessons);
      if (res.data?.certificate) {
        setCertificate(res.data.certificate);
      }

      // Find first uncompleted lesson
      const firstUncompleted = fetchedLessons.findIndex(l => !l.is_completed);
      if (firstUncompleted !== -1) {
        setActiveLessonIndex(firstUncompleted);
      } else if (fetchedLessons.length > 0) {
        setActiveLessonIndex(0);
      }
    } catch (err) {
      console.error('Failed to load course lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCompleteLesson = async (lesson) => {
    if (!lesson) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/courses/${courseId}/lessons/${lesson.id}/complete`);
      
      // Update local lesson state
      setLessons(prev =>
        prev.map(l => (l.id === lesson.id ? { ...l, is_completed: 1 } : l))
      );

      if (res.data?.coinsAwarded > 0) {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.8 }
        });
        showToast(`🎉 Lesson completed! +5 Coins awarded.`);
      } else {
        showToast('Lesson marked as completed.');
      }

      if (res.data?.newBalance !== undefined) {
        updateCoinBalance(res.data.newBalance);
      }

      // Advance to next lesson if available
      if (activeLessonIndex < lessons.length - 1) {
        setActiveLessonIndex(prev => prev + 1);
      } else {
        // Last lesson completed! Offer quiz
        setIsQuizMode(true);
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err);
      showToast(err.response?.data?.error || 'Failed to record completion', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectQuizOption = (lessonId, optionKey) => {
    setQuizAnswers(prev => ({
      ...prev,
      [lessonId]: optionKey
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      setQuizSubmitting(true);
      const res = await api.post(`/courses/${courseId}/quiz`, {
        answers: quizAnswers
      });

      setQuizResult(res.data);

      if (res.data?.passed) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        if (res.data?.newBalance !== undefined) {
          updateCoinBalance(res.data.newBalance);
        }
        if (res.data?.certificate) {
          setCertificate(res.data.certificate);
          setShowCertModal(true);
        }
        showToast(`🏆 Congratulations! You scored ${res.data.score}% and earned 100 Bonus Coins!`);
      } else {
        showToast(`Score: ${res.data?.score}%. You need 70% to pass. Please review lessons and retry.`, 'error');
      }
    } catch (err) {
      console.error('Quiz submission error:', err);
      showToast(err.response?.data?.error || 'Failed to submit quiz', 'error');
    } finally {
      setQuizSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading course curriculum and lesson player..." />;
  }

  if (!course) {
    return (
      <div className="p-8 text-center space-y-4 bg-white rounded-3xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
        <p className="text-sm text-slate-500">The requested course could not be loaded or you are not enrolled.</p>
        <Link
          to="/student/courses"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          Return to Courses
        </Link>
      </div>
    );
  }

  const currentLesson = lessons[activeLessonIndex] || null;
  const completedCount = lessons.filter(l => l.is_completed).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const verificationUrl = certificate
    ? `${window.location.origin}/verify/${certificate.certificate_code}`
    : '';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl border flex items-center space-x-3 transition-all animate-bounce ${
            toastMsg.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
        >
          {toastMsg.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMsg.message}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/student/courses')}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Back to Courses"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {course.category || 'Engineering'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-slate-500">
                Lesson {activeLessonIndex + 1} of {lessons.length}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{course.title}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Coin Badge */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm">
            <Coins className="w-4 h-4 text-amber-600 fill-amber-400" />
            <span className="text-xs font-extrabold">{user?.coinBalance ?? 0} Coins</span>
          </div>

          {certificate && (
            <button
              onClick={() => setShowCertModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold hover:brightness-110 shadow-sm flex items-center space-x-1.5"
            >
              <Award className="w-4 h-4" />
              <span>View Certificate</span>
            </button>
          )}
        </div>
      </div>

      {/* Overall Progress Tracker */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
            {progressPercent}%
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              {completedCount} of {lessons.length} Modules Completed
            </p>
            <p className="text-[11px] text-slate-500">
              Complete each lesson to earn +5 coins; pass the final quiz to earn an official certificate and +100 coins!
            </p>
          </div>
        </div>
        <div className="w-full sm:w-64 bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Sidebar + Lesson Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Lesson List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Curriculum Outline</h3>
              <span className="text-xs font-bold text-slate-400">{lessons.length} Modules</span>
            </div>

            <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
              {lessons.map((lesson, idx) => {
                const isActive = !isQuizMode && activeLessonIndex === idx;
                const isCompleted = !!lesson.is_completed;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setIsQuizMode(false);
                      setActiveLessonIndex(idx);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-start space-x-3 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-100'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2
                          className={`w-4 h-4 ${isActive ? 'text-indigo-200' : 'text-emerald-600'}`}
                        />
                      ) : (
                        <Circle
                          className={`w-4 h-4 ${isActive ? 'text-indigo-200' : 'text-slate-300'}`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                          Module {idx + 1}
                        </span>
                        <span className={`text-[10px] flex items-center space-x-1 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                          <Clock className="w-3 h-3 inline" />
                          <span>{lesson.duration_minutes || 15}m</span>
                        </span>
                      </div>
                      <p className={`text-xs font-bold truncate mt-0.5 ${isActive ? 'text-white' : 'text-slate-800'}`}>
                        {lesson.title}
                      </p>
                    </div>
                  </button>
                );
              })}

              {/* Quiz Module Entry */}
              <button
                onClick={() => setIsQuizMode(true)}
                className={`w-full text-left p-3 rounded-2xl transition flex items-start space-x-3 border ${
                  isQuizMode
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 border-amber-500'
                    : 'bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 border-amber-200'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  <Award className={`w-4 h-4 ${isQuizMode ? 'text-amber-100' : 'text-amber-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isQuizMode ? 'text-amber-100' : 'text-amber-700'}`}>
                      Final Assessment
                    </span>
                    <span className={`text-[10px] font-bold ${isQuizMode ? 'text-amber-100' : 'text-amber-600'}`}>
                      +100 Coins
                    </span>
                  </div>
                  <p className={`text-xs font-bold truncate mt-0.5 ${isQuizMode ? 'text-white' : 'text-amber-900'}`}>
                    Certification Comprehensive Quiz
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Main Area: Reader or Quiz */}
        <div className="lg:col-span-8 space-y-4">
          {!isQuizMode && currentLesson ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              {/* Lesson Header */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Module {activeLessonIndex + 1} of {lessons.length}
                  </span>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Estimated time: {currentLesson.duration_minutes || 15} mins</span>
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-3">
                  {currentLesson.title}
                </h2>
              </div>

              {/* Lesson Content Area */}
              <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-4">
                {currentLesson.markdown_content ? (
                  <div className="whitespace-pre-line font-sans text-slate-700 bg-slate-50/70 p-6 rounded-2xl border border-slate-200/60 leading-relaxed font-normal">
                    {currentLesson.markdown_content}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <BookOpen className="w-8 h-8 text-indigo-500 mx-auto" />
                    <p className="font-semibold text-slate-700">Detailed Lesson Notes</p>
                    <p className="text-xs text-slate-500">
                      Carefully read through the curriculum specifications above. When you are ready, test your comprehension or proceed to complete the module.
                    </p>
                  </div>
                )}
              </div>

              {/* Embedded Mini-Quiz Question for this lesson if available */}
              {currentLesson.quiz_question && (
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Quick Concept Check</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {currentLesson.quiz_question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const text = currentLesson[`quiz_option_${opt.toLowerCase()}`];
                      if (!text) return null;
                      const isSelected = quizAnswers[currentLesson.id] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => handleSelectQuizOption(currentLesson.id, opt)}
                          className={`text-left p-2.5 rounded-xl text-xs font-medium border transition flex items-center space-x-2 ${
                            isSelected
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                            isSelected ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {opt}
                          </span>
                          <span className="truncate">{text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    disabled={activeLessonIndex === 0}
                    onClick={() => setActiveLessonIndex(prev => Math.max(0, prev - 1))}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    disabled={activeLessonIndex === lessons.length - 1}
                    onClick={() => setActiveLessonIndex(prev => Math.min(lessons.length - 1, prev + 1))}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  {!currentLesson.is_completed ? (
                    <button
                      onClick={() => handleCompleteLesson(currentLesson)}
                      disabled={actionLoading}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark Complete & Earn +5 Coins</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Module Finished</span>
                    </div>
                  )}

                  {activeLessonIndex === lessons.length - 1 && (
                    <button
                      onClick={() => setIsQuizMode(true)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-sm flex items-center justify-center space-x-2"
                    >
                      <Award className="w-4 h-4" />
                      <span>Take Final Quiz</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Final Assessment / Quiz View */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Certification Examination
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Passing Grade: 70%
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-3">
                  Comprehensive Certification Quiz
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Answer the assessment questions below based on the course modules. Score at least 70% to instantly graduate, receive your verifiable certificate, and earn a bonus 100 EduPulse Coins!
                </p>
              </div>

              {quizResult && (
                <div
                  className={`p-5 rounded-2xl border ${
                    quizResult.passed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  } space-y-2`}
                >
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    {quizResult.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <span>
                      {quizResult.passed
                        ? `🎉 Congratulations! Exam Passed with ${quizResult.score}%`
                        : `Exam Not Passed: Score ${quizResult.score}% (70% required)`}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {quizResult.passed
                      ? 'Your official verifiable certificate has been issued and 100 EduPulse Coins have been credited to your account!'
                      : 'You scored below the 70% mastery threshold. Please review the curriculum lessons and re-attempt the quiz.'}
                  </p>
                  {quizResult.passed && (
                    <button
                      onClick={() => setShowCertModal(true)}
                      className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm inline-flex items-center space-x-1.5"
                    >
                      <Award className="w-4 h-4" />
                      <span>View & Download Certificate</span>
                    </button>
                  )}
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {lessons
                  .filter(l => l.quiz_question)
                  .map((qLesson, qIdx) => {
                    const selected = quizAnswers[qLesson.id];

                    return (
                      <div
                        key={qLesson.id}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                          <span>Question {qIdx + 1}</span>
                          <span className="text-[11px] text-indigo-600 font-bold">Module: {qLesson.title}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">
                          {qLesson.quiz_question}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {['A', 'B', 'C', 'D'].map(opt => {
                            const optionText = qLesson[`quiz_option_${opt.toLowerCase()}`];
                            if (!optionText) return null;
                            const isChosen = selected === opt;

                            return (
                              <button
                                key={opt}
                                onClick={() => handleSelectQuizOption(qLesson.id, opt)}
                                className={`text-left p-3 rounded-xl text-xs font-medium border transition flex items-center space-x-3 ${
                                  isChosen
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                    isChosen ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {opt}
                                </span>
                                <span className="flex-1">{optionText}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Quiz Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setIsQuizMode(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Return to Lessons
                </button>

                <button
                  onClick={handleSubmitQuiz}
                  disabled={quizSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-md shadow-amber-500/20 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Award className="w-4 h-4" />
                  <span>{quizSubmitting ? 'Evaluating Assessment...' : 'Submit Assessment for Certification'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verified Certificate Modal */}
      <Modal
        isOpen={showCertModal && !!certificate}
        onClose={() => setShowCertModal(false)}
        title="Official Verified Certificate"
        maxWidth="max-w-4xl"
      >
        {certificate && (
          <div className="space-y-6">
            {/* The Certificate Frame */}
            <div className="print-container relative bg-white border-8 border-double border-amber-600/60 p-8 sm:p-12 rounded-2xl shadow-inner text-center selection:bg-amber-100 overflow-hidden">
              {/* Corner Ornaments */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-700" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-700" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-700" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-700" />

              {/* Watermark Crest */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Award className="w-96 h-96 text-amber-900" />
              </div>

              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-center space-x-2 text-indigo-700 font-extrabold text-sm tracking-widest uppercase">
                  <span>EduPulse AI Academy of Engineering</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-slate-900">
                  Certificate of Academic Excellence
                </h1>

                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                  This is proudly presented to
                </p>

                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-indigo-900 border-b-2 border-amber-300 inline-block px-8 pb-2">
                  {user?.name || 'Scholar'}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                  For outstanding academic proficiency and successful mastery of all rigorous assessment modules in
                </p>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {course.title}
                </h3>

                {/* Signatures & QR Section */}
                <div className="grid grid-cols-3 gap-4 pt-8 max-w-xl mx-auto border-t border-slate-200 items-center">
                  <div className="text-center">
                    <div className="font-handwriting text-xl text-slate-800 border-b border-slate-400 pb-1">
                      {course.teacher_name || 'Dr. Arthur Pendelton'}
                    </div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Lead Instructor</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(verificationUrl)}`}
                      alt="Verification QR Code"
                      className="w-20 h-20 border-2 border-slate-200 rounded-lg p-1 bg-white shadow-sm"
                    />
                    <span className="text-[9px] font-mono text-slate-400 mt-1">Scan to Verify</span>
                  </div>

                  <div className="text-center">
                    <div className="font-handwriting text-xl text-slate-800 border-b border-slate-400 pb-1">
                      Academic Dean
                    </div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Verification Authority</p>
                  </div>
                </div>

                <div className="pt-4 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100">
                  <span>Issued: {new Date(certificate.issued_at || Date.now()).toLocaleDateString()}</span>
                  <span className="font-mono font-bold text-amber-700">ID: {certificate.certificate_code}</span>
                  <Link
                    to={`/verify/${certificate.certificate_code}`}
                    target="_blank"
                    className="text-indigo-600 hover:underline flex items-center space-x-1"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Print & Download Action Buttons */}
            <div className="flex items-center justify-between no-print pt-2">
              <Link
                to={`/verify/${certificate.certificate_code}`}
                target="_blank"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Public Verification Page</span>
              </Link>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default LessonPlayer;
