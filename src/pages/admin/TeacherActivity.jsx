import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import DataTable from '../../components/DataTable';
import { ShieldCheck, BookOpen, Clock, MessageSquare, Star, Users } from 'lucide-react';

export function TeacherActivity() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeacherActivity() {
      try {
        const res = await api.get('/admin/teacher-activity');
        setTeachers(res.data?.teachers || []);
      } catch (err) {
        console.error('Failed to load teacher activity:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTeacherActivity();
  }, []);

  if (loading) {
    return <Loader text="Loading faculty operational audits and engagement records..." />;
  }

  const columns = [
    {
      header: 'Faculty Member',
      accessor: 'name',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900">{row.name}</span>
          <div className="text-[11px] text-slate-400">{row.email}</div>
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
      header: 'Courses Managed',
      accessor: 'coursesManaged',
      render: (row) => (
        <div>
          <span className="font-bold text-xs text-indigo-700">{row.coursesManaged} courses</span>
          <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={row.courseList?.join(', ')}>
            {row.courseList?.join(', ')}
          </div>
        </div>
      )
    },
    {
      header: 'Login Frequency',
      accessor: 'totalLogins',
      render: (row) => (
        <span className="text-xs text-slate-700 font-semibold">
          {row.totalLogins} logins
        </span>
      )
    },
    {
      header: 'Last Authentication',
      accessor: 'lastLogin',
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">
          {row.lastLogin ? new Date(row.lastLogin).toLocaleDateString() : 'Never'}
        </span>
      )
    },
    {
      header: 'Student Feedback Rating',
      accessor: 'avgRating',
      render: (row) => (
        <div className="flex items-center space-x-1.5">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span className="font-bold text-xs text-slate-800">{row.avgRating || '5.0'} / 5.0</span>
          <span className="text-[10px] text-slate-400">({row.feedbackCount} reviews)</span>
        </div>
      )
    },
    {
      header: 'Platform Engagement',
      accessor: 'timeSpentMinutes',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700">
          {row.timeSpentMinutes} mins
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
            <span>Faculty Activity & Operations Audit</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {teachers.length} Faculty Members
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tracking instructional courses managed, student evaluations, login frequency, and platform activity
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={teachers}
        searchPlaceholder="Search faculty members..."
      />
    </div>
  );
}

export default TeacherActivity;
