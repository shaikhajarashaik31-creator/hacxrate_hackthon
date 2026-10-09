import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import DataTable from '../../components/DataTable';
import { CalendarCheck, AlertTriangle, FileText, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export function Attendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const res = await api.get('/student/attendance');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load attendance:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, []);

  if (loading) {
    return <Loader text="Loading attendance logs and lecture records..." />;
  }

  const { summary, perCourse, logs } = data || {
    summary: { totalClasses: 0, presentCount: 0, absentCount: 0, overallRate: 100 },
    perCourse: [],
    logs: []
  };

  const columns = [
    {
      header: 'Course',
      accessor: 'course_title',
      render: (row) => (
        <span className="font-semibold text-slate-800">{row.course_title}</span>
      )
    },
    {
      header: 'Date',
      accessor: 'class_date',
      render: (row) => (
        <span className="text-slate-600 font-mono text-xs">{row.class_date}</span>
      )
    },
    {
      header: 'Attendance Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
            row.status === 'present'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {row.status === 'present' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Present</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Absent</span>
            </>
          )}
        </span>
      )
    },
    {
      header: 'Autonomous Lecture Notes',
      render: (row) => {
        if (row.status === 'absent') {
          return (
            <Link
              to={`/student/notes?course_id=${row.course_id}&class_date=${row.class_date}`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>AI Handwritten Notes</span>
              <ArrowRight className="w-3 h-3 text-amber-600" />
            </Link>
          );
        }
        return <span className="text-xs text-slate-400">Attended in person</span>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if below 80% */}
      {summary.overallRate < 80 ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">Attendance Notice: Below 80% Threshold ({summary.overallRate}%)</p>
            <p className="text-amber-700 mt-0.5">
              University regulations require 80% minimum attendance for honors electives and exam qualification. Review your missed lecture notes below to catch up on curriculum.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-semibold">
            Excellent Attendance! You are currently at {summary.overallRate}%, eligible for academic bonus coins and honors electives.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Overall Attendance</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.overallRate}%</h3>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full ${summary.overallRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${summary.overallRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Lectures</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.totalClasses}</h3>
          <p className="text-xs text-slate-400 mt-1">Recorded sessions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Attended (Present)</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{summary.presentCount}</h3>
          <p className="text-xs text-emerald-600/70 mt-1">Full engagement</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Missed (Absent)</p>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{summary.absentCount}</h3>
          <p className="text-xs text-rose-600/70 mt-1">Auto-synthesized notes</p>
        </div>
      </div>

      {/* Per-Course Breakdown Cards */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3">Course Attendance Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {perCourse.map((c) => (
            <div key={c.course_id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-slate-800 truncate" title={c.course_title}>
                {c.course_title}
              </h4>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900">{c.attendance_percentage}%</span>
                <span className="text-[11px] text-slate-400">{c.present_count} / {c.total_classes}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${c.attendance_percentage >= 80 ? 'bg-indigo-600' : 'bg-amber-500'}`}
                  style={{ width: `${c.attendance_percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Attendance Log Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900">Attendance Telemetry History</h3>
          <span className="text-xs text-slate-500">Clicking absent items opens AI handwritten notes</span>
        </div>
        <DataTable
          columns={columns}
          data={logs}
          searchPlaceholder="Filter by course, date, status..."
        />
      </div>
    </div>
  );
}

export default Attendance;
