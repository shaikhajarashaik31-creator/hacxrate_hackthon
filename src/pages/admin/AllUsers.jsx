import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import {
  Users,
  Shield,
  GraduationCap,
  Mail,
  Sparkles,
  UserCheck,
  UserPlus,
  KeyRound,
  Copy,
  Check,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';

export function AllUsers() {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'economy'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Economy state
  const [economyStats, setEconomyStats] = useState(null);
  const [economyLoading, setEconomyLoading] = useState(false);

  // Create User Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    department: 'Computer Science',
    skills: '',
    interests: ''
  });
  const [creating, setCreating] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);

  // Reset Password Modal state
  const [resetResult, setResetResult] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [roleFilter, searchQuery]);

  useEffect(() => {
    if (activeTab === 'economy') {
      loadEconomy();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (roleFilter !== 'all') queryParams.append('role', roleFilter);
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());

      const res = await api.get(`/admin/users?${queryParams.toString()}`);
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEconomy = async () => {
    try {
      setEconomyLoading(true);
      const res = await api.get('/admin/economy');
      setEconomyStats(res.data?.stats);
    } catch (err) {
      console.error('Failed to load economy stats:', err);
    } finally {
      setEconomyLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email) return;

    try {
      setCreating(true);
      const res = await api.post('/admin/users', createForm);
      setCreatedResult(res.data);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Reset this user\'s password to a new temporary credential?')) return;
    try {
      setResettingId(userId);
      const res = await api.post(`/admin/users/${userId}/reset-password`);
      setResetResult(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setResettingId(null);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const columns = [
    {
      header: 'User Identity',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-slate-900">{row.name}</span>
            {row.must_change_password === 1 && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800" title="Password change required">
                Pending Reset
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">{row.email}</div>
        </div>
      )
    },
    {
      header: 'System Role',
      accessor: 'role',
      render: (row) => {
        const badgeColors = {
          student: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          teacher: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          admin: 'bg-violet-50 text-violet-700 border-violet-200'
        }[row.role];

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badgeColors}`}>
            {row.role}
          </span>
        );
      }
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => (
        <span className="text-xs text-slate-600">{row.department || 'General Studies'}</span>
      )
    },
    {
      header: 'Last Authentication',
      accessor: 'last_login',
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">
          {row.last_login ? new Date(row.last_login).toLocaleDateString() : 'Never'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleResetPassword(row.id)}
            disabled={resettingId === row.id}
            className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition flex items-center space-x-1"
            title="Generate new temporary password"
          >
            <KeyRound className="w-3 h-3" />
            <span>Reset Password</span>
          </button>
          <button
            onClick={() => setSelectedUser(row)}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            Details
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>User Management & Token Economy</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Admin Console
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Provision faculty and student credentials, manage individual passwords, and monitor the EduPulse Coin economy
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'directory' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Directory</span>
            </button>
            <button
              onClick={() => setActiveTab('economy')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'economy' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Coin Economy</span>
            </button>
          </div>

          <button
            onClick={() => {
              setCreatedResult(null);
              setCreateForm({
                name: '',
                email: '',
                department: 'Computer Science',
                skills: '',
                interests: ''
              });
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500">Filter Role:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
                {['all', 'student', 'teacher', 'admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3 py-1 rounded-lg capitalize font-semibold transition ${
                      roleFilter === role ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <Loader text="Loading users directory..." />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <DataTable columns={columns} data={users} />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COIN ECONOMY ANALYTICS */}
      {activeTab === 'economy' && (
        <div className="space-y-6">
          {economyLoading || !economyStats ? (
            <Loader text="Loading EduPulse Token Economy metrics..." />
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Minted</p>
                    <h3 className="text-3xl font-black text-emerald-600 mt-1">+{economyStats.totalIssued}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Rewards distributed</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spent</p>
                    <h3 className="text-3xl font-black text-rose-500 mt-1">-{economyStats.totalSpent}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Course enrollments</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                    <ArrowDownRight className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net In Circulation</p>
                    <h3 className="text-3xl font-black text-amber-600 mt-1">{economyStats.netCirculation}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Active token supply</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Coins className="w-6 h-6 fill-amber-400" />
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Wallets</p>
                    <h3 className="text-3xl font-black text-indigo-600 mt-1">{economyStats.activeHoldersCount}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Students with balance</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Leaderboard and Recent Economy Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Student Balances */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">Largest Student Treasuries</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-400">Leaderboard</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {(economyStats.topHolders || []).map((holder, idx) => (
                      <div key={holder.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                            idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{holder.name}</p>
                            <p className="text-[11px] text-slate-400">{holder.email}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold flex items-center space-x-1">
                          <Coins className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
                          <span>{holder.balance} Coins</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Platform Economy Ledger */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">Global Economy Feed</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-400">Live Ledger</span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                    {(economyStats.recentTransactions || []).map((tx) => {
                      const isGain = tx.amount > 0;
                      return (
                        <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{tx.student_name}</p>
                            <p className="text-[11px] text-slate-500">{tx.reason}</p>
                            <span className="text-[10px] text-slate-400">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-xl font-black ${
                              isGain
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {isGain ? `+${tx.amount}` : tx.amount} Coins
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Provision New University Account"
        maxWidth="max-w-md"
      >
        {createdResult ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-3">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <Check className="w-5 h-5 text-emerald-600" />
                <span>Account Created Successfully!</span>
              </div>
              <p className="text-xs text-emerald-800">
                A temporary password has been cryptographically generated. The user will be required to change it immediately upon their first login.
              </p>

              <div className="p-3 bg-white rounded-xl border border-emerald-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Temporary Password</span>
                  <span className="font-mono font-black text-sm text-slate-900 select-all">
                    {createdResult.temporaryPassword}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyText(createdResult.temporaryPassword)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center space-x-1"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCreateModal(false);
                setCreatedResult(null);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Elena Rostova"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">University Email Address</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="e.g. elena@student.edu (or @teacher.edu / @admin.edu)"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Domain rules: @admin.edu = Administrator, @teacher.edu = Faculty, all others = Student.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Department</label>
              <input
                type="text"
                value={createForm.department}
                onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Technical Skills (Optional)</label>
              <input
                type="text"
                value={createForm.skills}
                onChange={(e) => setCreateForm({ ...createForm, skills: e.target.value })}
                placeholder="e.g. Python, SQL, React"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-sm flex items-center space-x-1.5"
              >
                {creating ? <span>Generating Account...</span> : <span>Create Account</span>}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* PASSWORD RESET RESULT MODAL */}
      <Modal
        isOpen={!!resetResult}
        onClose={() => setResetResult(null)}
        title="Temporary Password Generated"
        maxWidth="max-w-md"
      >
        {resetResult && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <span>Password Reset Successful</span>
              </div>
              <p className="text-xs text-amber-800">
                {resetResult.message}. The user must use this temporary credential and will be immediately prompted to set their own new password.
              </p>

              <div className="p-3 bg-white rounded-xl border border-amber-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">New Temporary Password</span>
                  <span className="font-mono font-black text-sm text-slate-900 select-all">
                    {resetResult.temporaryPassword}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyText(resetResult.temporaryPassword)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition flex items-center space-x-1"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setResetResult(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* USER DETAILS MODAL */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Identity Profile"
        maxWidth="max-w-md"
      >
        {selectedUser && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                {selectedUser.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedUser.name}</h4>
                <p className="text-slate-500 font-mono text-[11px]">{selectedUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-semibold">Department:</span>
                <span className="text-slate-800 font-bold">{selectedUser.department || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-semibold">Password Status:</span>
                <span className={selectedUser.must_change_password ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {selectedUser.must_change_password ? 'Must Change Password' : 'Active & Verified'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-semibold">Skills:</span>
                <span className="text-slate-800 font-medium text-right max-w-xs">{selectedUser.skills || 'None'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-semibold">Last Login:</span>
                <span className="text-slate-800 font-mono">
                  {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  const id = selectedUser.id;
                  setSelectedUser(null);
                  handleResetPassword(id);
                }}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 transition flex items-center space-x-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Reset Password</span>
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AllUsers;
