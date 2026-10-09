import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import {
  BookOpen,
  Coins,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Star,
  PlayCircle,
  ShieldCheck,
  Award
} from 'lucide-react';

export function CourseStore() {
  const { user, updateCoinBalance } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingId, setEnrollingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  const loadStore = async () => {
    try {
      const res = await api.get('/courses', {
        params: {
          category: selectedCategory,
          search: searchQuery
        }
      });
      setCourses(res.data.courses || []);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to load courses store:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, [selectedCategory, searchQuery]);

  // Handle enrollment
  const handleEnroll = async (course) => {
    // If paid and insufficient coins, guard early
    if (course.is_extra && course.coin_cost > 0 && (user?.coinBalance || 0) < course.coin_cost) {
      alert(`Insufficient coins balance! You have ${user?.coinBalance || 0} coins, but ${course.coin_cost} coins are required. Complete lessons, mock tests, or practice arena problems to earn coins.`);
      return;
    }

    setEnrollingId(course.id);
    try {
      const res = await api.post(`/courses/${course.id}/enroll`);
      if (res.data.newBalance !== undefined) {
        updateCoinBalance(res.data.newBalance);
      }
      setToastMsg(`Successfully enrolled in ${course.title}!`);
      setTimeout(() => setToastMsg(null), 4000);
      await loadStore();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to enroll in course');
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading && !courses.length) {
    return <Loader text="Loading EduPulse Course Store & Electives..." />;
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner with Coin Balance */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-amber-300 border border-white/20">
              💎 Certification Classes & Electives
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            EduPulse Course Store
          </h1>
          <p className="text-xs text-indigo-200 max-w-xl">
            Explore 20+ courses across Web Development, Python, AI/ML, Cloud, Security, and Interview Prep. Unlock premium certification classes with your earned learning coins!
          </p>
        </div>

        {/* Live Coin Balance Card */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center space-x-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-md">
            <Coins className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-indigo-200">Your Coin Balance</p>
            <p className="text-2xl font-black text-amber-300">{user?.coinBalance || 0} Coins</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, instructors, keywords..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        {/* 12 Categories Pill Scroll */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-2xl scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex-shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({courses.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isEnrolled = Boolean(course.enrollment_status);
          const isCompleted = course.enrollment_status === 'completed';
          const canAfford = (user?.coinBalance || 0) >= (course.coin_cost || 0);

          return (
            <div
              key={course.id}
              className="rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Top */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {course.category || 'Engineering'}
                  </span>

                  {/* Price Badge */}
                  {course.is_extra ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>{course.coin_cost} Coins</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Free (Core Curriculum)
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {course.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <span className="font-semibold">{course.instructor_name || 'Faculty Expert'}</span>
                  <div className="flex items-center space-x-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{course.rating || 4.9}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer / Action */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                {isEnrolled ? (
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{isCompleted ? 'Completed (Certified)' : `${course.progress_percent || 0}% Progress`}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/student/courses/${course.id}/learn`)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center space-x-1 shadow-sm transition"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Continue</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <span className="text-slate-400 font-medium">
                      {course.total_lessons || 3} Lessons + Final Quiz
                    </span>
                    <button
                      onClick={() => handleEnroll(course)}
                      disabled={enrollingId === course.id}
                      className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-1.5 shadow-sm transition ${
                        course.is_extra && !canAfford
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                      }`}
                    >
                      {enrollingId === course.id ? (
                        <span>Enrolling...</span>
                      ) : course.is_extra ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock with {course.coin_cost} Coins</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Enroll Free</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CourseStore;
