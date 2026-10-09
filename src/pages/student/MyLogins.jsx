import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import DataTable from '../../components/DataTable';
import { Clock, ShieldCheck, Laptop, CheckCircle2 } from 'lucide-react';

export function MyLogins() {
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogins() {
      try {
        const res = await api.get('/student/logins');
        setLogins(res.data?.logins || []);
      } catch (err) {
        console.error('Failed to load logins:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogins();
  }, []);

  if (loading) {
    return <Loader text="Loading your session security telemetry..." />;
  }

  const columns = [
    {
      header: 'Login Timestamp',
      accessor: 'login_time',
      render: (row) => (
        <span className="font-mono text-xs text-slate-800">
          {new Date(row.login_time).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Logout Timestamp',
      accessor: 'logout_time',
      render: (row) => (
        row.logout_time ? (
          <span className="font-mono text-xs text-slate-500">
            {new Date(row.logout_time).toLocaleString()}
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Session</span>
          </span>
        )
      )
    },
    {
      header: 'Session Duration',
      accessor: 'duration_minutes',
      render: (row) => (
        <span className="font-semibold text-xs text-indigo-700">
          {row.duration_minutes ? `${row.duration_minutes} mins` : 'Currently active'}
        </span>
      )
    },
    {
      header: 'Device IP',
      accessor: 'ip',
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          {row.ip || '127.0.0.1'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>My Security & Login History</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified Account
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Personal access logs, IP records, and active session authentication audits
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-500">Total Logins Recorded</p>
          <h3 className="text-2xl font-black text-slate-900">{logins.length}</h3>
          <p className="text-[11px] text-slate-400">Since account registration</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-500">Latest Active IP</p>
          <h3 className="text-2xl font-black text-indigo-600 font-mono text-xl">
            {logins[0]?.ip || '127.0.0.1'}
          </h3>
          <p className="text-[11px] text-slate-400">Current authentication gateway</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-500">Account Security Status</p>
          <h3 className="text-2xl font-black text-emerald-600 flex items-center space-x-1.5 text-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Encrypted (JWT)</span>
          </h3>
          <p className="text-[11px] text-emerald-600/70">Bcrypt password hashing</p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={logins}
        searchPlaceholder="Search logins by IP or timestamp..."
      />
    </div>
  );
}

export default MyLogins;
