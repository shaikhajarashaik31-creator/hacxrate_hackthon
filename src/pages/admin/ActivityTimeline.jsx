import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import {
  Activity,
  Clock,
  Award,
  FileCheck2,
  LogIn,
  BookOpen,
  User,
  ShieldCheck
} from 'lucide-react';

export function ActivityTimeline() {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimeline() {
      try {
        const res = await api.get('/admin/timeline');
        setTimeline(res.data?.timeline || []);
      } catch (err) {
        console.error('Failed to load timeline:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTimeline();
  }, []);

  if (loading) {
    return <Loader text="Loading global platform activity stream..." />;
  }

  const getEventIcon = (category) => {
    switch (category) {
      case 'certificate':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'test':
        return <FileCheck2 className="w-4 h-4 text-indigo-500" />;
      case 'login':
        return <LogIn className="w-4 h-4 text-emerald-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getEventColor = (category) => {
    switch (category) {
      case 'certificate':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'test':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'login':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Global Activity Timeline</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Feed
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time chronological events including logins, assessments, certificates, and learning telemetry
          </p>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6">
          {timeline.length === 0 ? (
            <p className="text-xs text-slate-400 py-6">No platform activity recorded yet.</p>
          ) : (
            timeline.map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Dot / Icon on timeline */}
                <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:shadow-sm hover:border-slate-200 transition space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center space-x-1 ${getEventColor(item.event_category)}`}>
                        {getEventIcon(item.event_category)}
                        <span>{item.title}</span>
                      </span>
                      <strong className="text-xs text-slate-900">{item.user_name}</strong>
                      <span className="text-[10px] text-slate-400 capitalize">({item.user_role})</span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 pl-1">{item.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityTimeline;
