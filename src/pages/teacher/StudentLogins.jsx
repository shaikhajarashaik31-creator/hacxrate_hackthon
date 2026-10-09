import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import DataTable from '../../components/DataTable';
import { Clock, Users, Laptop } from 'lucide-react';

export function StudentLogins() {
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogins() {
      try {
        const res = await api.get('/teacher/student-logins');
        setLogins(res.data?.logins || []);
      } catch (err) {
        console.error('Failed to load student logins:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogins();
  }, []);

  if (loading) {
    return <Loader text="Loading student authentication history..." />;
  }

  const columns = [
    {
      header: 'Student',
      accessor: 'student_name',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900">{row.student_name}</span>
          <div className="text-[11px] text-slate-400">{row.student_email}</div>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => (
        <span className="text-xs text-slate-600">{row.department}</span>
      )
    },
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
      header: 'Duration',
      accessor: 'duration_minutes',
      render: (row) => (
        row.duration_minutes ? (
          <span className="font-semibold text-xs text-indigo-700">
            {row.duration_minutes} mins
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Now</span>
          </span>
        )
      )
    },
    {
      header: 'Client IP',
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
            <span>Student Access & Login Telemetry</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {logins.length} Sessions Logged
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Audit which enrolled students have logged in, access frequency, and session durations
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logins}
        searchPlaceholder="Search logins by student name, email or IP..."
      />
    </div>
  );
}

export default StudentLogins;
