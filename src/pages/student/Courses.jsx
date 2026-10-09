import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import {
  BookOpen,
  Coins,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Award,
  Play,
  Check,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function Courses() {
  const { user, updateCoinBalance } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollModal, setEnrollModal] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data?.courses || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (course) => {
    setErrorMsg('');
    setSuccessMsg('');
    if (course.is_extra && (user?.coinBalance || 0) < course.coin_cost) {
      setErrorMsg(`Insufficient coins! You need ${course.coin_cost} coins, but only have ${user?.coinBalance || 0}.`);
      return;
    }
    setEnrollModal(course);
  };

  const confirmEnroll = async () => {
    if (!enrollModal) return;
    setEnrolling(true);
    setErrorMsg('');

    try {
      const res = await api.post(`/courses/${enrollModal.id}/enroll`);
      if (res.data?.newBalance !== undefined) {
        updateCoinBalance(res.data.newBalance);
      }
      setSuccessMsg(`Successfully enrolled in "${enrollModal.title}"!`);
      setEnrollModal(null);
      await loadCourses();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const advanceProgress = async (course) => {
    const nextProgress = Math.min(100, (course.progress_percent || 0) + 20);
    try {
      const res = await api.post(`/courses/${course.id}/progress`, {
        progress_percent: nextProgress
      });
      if (res.data?.newBalance !== undefined) {
        updateCoinBalance(res.data.newBalance);
      }
      if (nextProgress === 100) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
        setSuccessMsg(`🎉 Congratulations! You completed "${course.title}" and earned your official certificate!`);
      }
      await loadCourses();
    } catch (err) {
      console.error('Failed to update course progress:', err);
    }
  };

  if (loading) {
    return <Loader text="Loading courses curriculum and extra electives..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Courses & Electives</h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete coursework, earn reward coins, and unlock industry-grade advanced electives
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm">
            <Coins className="w-5 h-5 text-amber-600 fill-amber-400" />
            <div>
              <p className="text-[10px] text-amber-700 font-semibold uppercase">Coin Balance</p>
              <p className="text-base font-black leading-none">{user?.coinBalance ?? 0} Coins</p>
            </div>
          </div>
          <Link
            to="/student/course-store"
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Course Store</span>
          </Link>
          <Link
            to="/student/certificates"
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
          >
            <Award className="w-4 h-4" />
            <span>My Certificates</span>
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isEnrolled = !!course.enrollment_status;
          const isCompleted = course.enrollment_status === 'completed' || course.progress_percent === 100;
          const canAfford = (user?.coinBalance || 0) >= course.coin_cost;

          return (
            <div
              key={course.id}
              className={`bg-white rounded-3xl p-6 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between relative overflow-hidden ${
                course.is_extra ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200/80'
              }`}
            >
              <div>
                {/* Badge Header */}
                <div className="flex items-center justify-between mb-3">
                  {course.is_extra ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-300">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Advanced Extra · {course.coin_cost} Coins</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Standard Curriculum
                    </span>
                  )}

                  {isCompleted && (
                    <span className="flex items-center space-x-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Certified</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Instructor:</span>
                    <strong className="text-slate-800">{course.teacher_name || 'Faculty'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Curriculum Lessons:</span>
                    <strong className="text-slate-800">{course.total_lessons} lessons</strong>
                  </div>
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                {isEnrolled ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">Course Progress</span>
                      <strong className="text-indigo-600 font-extrabold">{course.progress_percent}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                        style={{ width: `${course.progress_percent}%` }}
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <Link
                        to={`/student/courses/${course.id}/learn`}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Review Lessons' : 'Continue Lessons'}</span>
                      </Link>
                      {isCompleted && (
                        <Link
                          to="/student/certificates"
                          className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center justify-center space-x-1"
                        >
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Cert</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    {course.is_extra && !canAfford ? (
                      <div className="space-y-2">
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed flex items-center justify-center space-x-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Need {course.coin_cost} Coins (Have {user?.coinBalance ?? 0})</span>
                        </button>
                        <p className="text-[11px] text-amber-700 text-center font-medium">
                          Earn coins by scoring ≥80% on mock tests!
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm ${
                          course.is_extra
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                        }`}
                      >
                        {course.is_extra ? (
                          <>
                            <Coins className="w-3.5 h-3.5" />
                            <span>Unlock for {course.coin_cost} Coins</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Enroll in Course</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enroll Confirmation Modal */}
      <Modal
        isOpen={!!enrollModal}
        onClose={() => setEnrollModal(null)}
        title="Confirm Course Enrollment"
      >
        {enrollModal && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to enroll in <strong className="text-slate-900">{enrollModal.title}</strong>?
            </p>

            {enrollModal.is_extra && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span>Coin Cost:</span>
                  <span>{enrollModal.coin_cost} Coins</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Your Current Balance:</span>
                  <span>{user?.coinBalance ?? 0} Coins</span>
                </div>
                <div className="flex items-center justify-between border-t border-amber-200 pt-1 font-semibold text-amber-800">
                  <span>Remaining after enrollment:</span>
                  <span>{(user?.coinBalance ?? 0) - enrollModal.coin_cost} Coins</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setEnrollModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmEnroll}
                disabled={enrolling}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Courses;
