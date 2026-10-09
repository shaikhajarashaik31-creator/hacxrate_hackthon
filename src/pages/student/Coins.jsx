import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import {
  Coins as CoinsIcon,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Code2,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  ChevronRight
} from 'lucide-react';

export function Coins() {
  const { user, updateCoinBalance } = useAuth();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all'); // all, earned, spent

  useEffect(() => {
    loadCoinsData();
  }, []);

  const loadCoinsData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/coins');
      setBalance(res.data?.balance ?? 0);
      setHistory(res.data?.history || []);
      if (res.data?.balance !== undefined) {
        updateCoinBalance(res.data.balance);
      }
    } catch (err) {
      console.error('Failed to load coins history:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalEarned = history
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = Math.abs(
    history
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const filteredHistory = history.filter(item => {
    if (filter === 'earned') return item.amount > 0;
    if (filter === 'spent') return item.amount < 0;
    return true;
  });

  if (loading) {
    return <Loader text="Loading your coin treasury and transaction ledger..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Treasury Balance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Golden Balance Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-8 text-white shadow-xl shadow-amber-500/20">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-amber-900/30 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-2xl bg-white/20 backdrop-blur-md">
                  <CoinsIcon className="w-6 h-6 text-amber-200 fill-amber-300" />
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-amber-100">
                  EduPulse Coin Treasury
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
                Active Student
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">Available Balance</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <h1 className="text-5xl font-black tracking-tight">{balance}</h1>
                <span className="text-xl font-bold text-amber-200">Coins</span>
              </div>
              <p className="text-xs text-amber-100/90 mt-2 max-w-md">
                Spend your reward coins to unlock industry-grade advanced courses, specialized electives, and certification tracks.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/student/course-store"
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-xs transition shadow-md flex items-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4 text-amber-700" />
                <span>Spend Coins in Course Store</span>
              </Link>
              <Link
                to="/student/practice"
                className="px-5 py-2.5 rounded-2xl bg-amber-800/40 hover:bg-amber-800/60 border border-white/20 text-white font-bold text-xs transition flex items-center space-x-2"
              >
                <Code2 className="w-4 h-4" />
                <span>Earn More in Arena</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Analytics Summary */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lifetime Earned</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">+{totalEarned}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Across practice, lessons & tests</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lifetime Spent</p>
              <h3 className="text-2xl font-black text-rose-500 mt-1">-{totalSpent}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Elective course unlock fees</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{history.length} Transactions</p>
                <p className="text-[10px] text-slate-400">Recorded on immutable ledger</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600">Verified</span>
          </div>
        </div>
      </div>

      {/* How to Earn Coins Guide */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">How to Earn EduPulse Coins</h3>
          </div>
          <span className="text-xs font-bold text-slate-400">Automatic Reward Rules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Code2 className="w-5 h-5 text-indigo-600" />
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
                  +10 / +25 / +50
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Practice Arena</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Solve coding challenges on your first attempt based on difficulty (Easy: +10, Medium: +25, Hard: +50).
              </p>
            </div>
            <Link
              to="/student/practice"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>Solve Code</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  +5 Per Module
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Course Lessons</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Study and mark each sequential lesson module as completed in your enrolled courses.
              </p>
            </div>
            <Link
              to="/student/courses"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center space-x-1"
            >
              <span>Read Lessons</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                  +100 Grand Prize
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Certification Exams</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Score ≥ 70% on final course examinations to earn an official certificate and 100 coins!
              </p>
            </div>
            <Link
              to="/student/course-store"
              className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center space-x-1"
            >
              <span>View Courses</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-5 h-5 text-rose-600" />
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                  +50 Coins
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Mock Assessments</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Score 80% or higher on computer science and core subjects mock tests to earn bonus rewards.
              </p>
            </div>
            <Link
              to="/student/mock-tests"
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center space-x-1"
            >
              <span>Take Test</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Transaction Ledger</h3>
            <p className="text-xs text-slate-500">Immutable ledger log of every coin earned and spent</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setFilter('earned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'earned' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Earned ({history.filter(h => h.amount > 0).length})
            </button>
            <button
              onClick={() => setFilter('spent')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'spent' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Spent ({history.filter(h => h.amount < 0).length})
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <CoinsIcon className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No transactions recorded under this filter</p>
            <p className="text-xs text-slate-400">Complete lessons or solve coding challenges to start earning!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Reference Key</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => {
                  const isPositive = item.amount > 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(item.created_at || Date.now()).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span className="font-semibold text-slate-800">{item.reason}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.reference_key || `tx_${item.id}`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPositive ? `+${item.amount}` : item.amount} Coins
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Coins;
