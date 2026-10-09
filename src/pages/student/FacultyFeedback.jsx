import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Coins,
  Eye,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Star,
  XCircle
} from 'lucide-react';

export function FacultyFeedback() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingCourseId, setSubmittingCourseId] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [feedbackNotice, setFeedbackNotice] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const loadSubjects = async () => {
    try {
      const res = await api.get('/student/faculty-feedback');
      setSubjects(res.data?.subjects || []);
    } catch (err) {
      console.error('Failed to load faculty feedback status:', err);
      setFeedbackError(err.response?.data?.error || 'Unable to load faculty eligibility details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const summary = useMemo(() => {
    const eligible = subjects.filter((subject) => subject.is_eligible && !subject.is_submitted).length;
    const submitted = subjects.filter((subject) => subject.is_submitted).length;
    const locked = subjects.length - eligible - submitted;

    return { eligible, submitted, locked, total: subjects.length };
  }, [subjects]);

  const updateDraft = (courseId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [courseId]: {
        rating: 5,
        comment: '',
        ...current[courseId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (subject) => {
    const draft = drafts[subject.course_id] || { rating: 5, comment: '' };
    const rating = Number(draft.rating || 5);
    const comment = (draft.comment || '').trim();

    if (!comment) {
      setFeedbackError('Please add a brief comment before submitting faculty feedback.');
      return;
    }

    setSubmittingCourseId(subject.course_id);
    setFeedbackError('');
    setFeedbackNotice('');

    try {
      const res = await api.post('/student/faculty-feedback', {
        course_id: subject.course_id,
        teacher_id: subject.teacher_id,
        rating,
        comment
      });

      setFeedbackNotice(res.data?.message || 'Feedback submitted successfully.');
      await loadSubjects();
      setDrafts((current) => ({
        ...current,
        [subject.course_id]: { rating: 5, comment: '' }
      }));
    } catch (err) {
      setFeedbackError(err.response?.data?.error || 'Unable to submit faculty feedback.');
    } finally {
      setSubmittingCourseId(null);
    }
  };

  if (loading) {
    return <Loader text="Loading faculty evaluation eligibility…" />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-700 to-purple-800 p-6 sm:p-8 text-white shadow-lg shadow-indigo-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-100 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Faculty Feedback Eligibility
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Evaluate Teaching Quality</h1>
            <p className="text-sm text-indigo-100">
              Students can review faculty only when both their attendance and subject grade meet the academic standard.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 min-w-[280px]">
            <div className="rounded-2xl bg-white/10 px-3 py-2 border border-white/10">
              <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-100">Eligible</p>
              <p className="mt-2 text-2xl font-black">{summary.eligible}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2 border border-white/10">
              <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-100">Submitted</p>
              <p className="mt-2 text-2xl font-black">{summary.submitted}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2 border border-white/10">
              <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-100">Locked</p>
              <p className="mt-2 text-2xl font-black">{summary.locked}</p>
            </div>
          </div>
        </div>
      </div>

      {feedbackNotice && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 font-semibold flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {feedbackError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 font-semibold flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-600" />
          <span>{feedbackError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {subjects.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-lg font-bold text-slate-700">No enrolled subjects available.</p>
            <p className="mt-2 text-sm">Your subject list will appear here once it is available in your academic profile.</p>
          </div>
        ) : (
          subjects.map((subject) => {
            const draft = drafts[subject.course_id] || { rating: 5, comment: '' };
            const isEligible = subject.is_eligible;
            const isSubmitted = subject.is_submitted;

            return (
              <div key={subject.course_id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">{subject.subject_code}</p>
                    <h2 className="mt-1 text-xl font-black text-slate-900">{subject.subject_name}</h2>
                    <p className="mt-1 text-sm text-slate-500">Faculty: <span className="font-semibold text-slate-700">{subject.faculty_name}</span></p>
                  </div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold border ${
                    isSubmitted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isEligible
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {isSubmitted ? <ShieldCheck className="h-3.5 w-3.5" /> : isEligible ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {subject.eligibility_status}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Attendance</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{subject.attendance_percentage}%</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Academic Score</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{subject.academic_score}%</p>
                  </div>
                </div>

                {!isSubmitted && !isEligible && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                      <span>
                        {subject.attendance_shortfall > 0 && subject.score_shortfall > 0
                          ? `You need ${subject.attendance_shortfall.toFixed(1)}% more attendance and ${subject.score_shortfall.toFixed(1)}% more academic score to unlock feedback.`
                          : subject.attendance_shortfall > 0
                            ? `You need ${subject.attendance_shortfall.toFixed(1)}% more attendance to unlock feedback.`
                            : `You need ${subject.score_shortfall.toFixed(1)}% more academic score to unlock feedback.`}
                      </span>
                    </div>
                  </div>
                )}

                {isEligible && !isSubmitted && (
                  <div className="mt-4 space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      This subject is eligible for faculty feedback.
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => updateDraft(subject.course_id, 'rating', value)}
                            className={`rounded-full p-2 transition ${
                              Number(draft.rating || 5) >= value
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-white text-slate-300 border border-slate-200'
                            }`}
                            aria-label={`Rate ${value} out of 5`}
                          >
                            <Star className="h-4 w-4 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Comment</label>
                      <textarea
                        value={draft.comment}
                        onChange={(event) => updateDraft(subject.course_id, 'comment', event.target.value)}
                        rows={4}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                        placeholder="Share how the faculty teaching style, clarity, and support impacted your learning experience."
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSubmit(subject)}
                      disabled={submittingCourseId === subject.course_id}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Coins className="h-4 w-4 text-amber-300" />
                      {submittingCourseId === subject.course_id ? 'Submitting...' : 'Submit Evaluation (+25 Spark Coins)'}
                    </button>
                  </div>
                )}

                {isSubmitted && (
                  <div className="mt-4 space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Feedback submitted successfully. You already earned your reward.
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedReview(subject.feedback)}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    >
                      <Eye className="h-4 w-4" />
                      View Submitted Review
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">Submitted Review</p>
                <h3 className="mt-1 text-xl font-black text-slate-900">Faculty Evaluation</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={`h-5 w-5 ${value <= (selectedReview?.rating || 0) ? 'fill-current' : 'text-slate-300'}`}
                  />
                ))}
                <span className="text-sm font-bold text-slate-700">{selectedReview?.rating || 0}/5</span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <MessageSquareQuote className="h-4 w-4 text-violet-600" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Your feedback</span>
                </div>
                <p className="text-sm leading-6 text-slate-700">{selectedReview?.comment || 'No review comment available.'}</p>
              </div>

              <p className="text-xs text-slate-500">
                Submitted on {selectedReview?.created_at ? new Date(selectedReview.created_at).toLocaleString() : 'recently'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyFeedback;
