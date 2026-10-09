import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend = null, badge = null }) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100 hover:border-indigo-200',
      dot: 'bg-indigo-500'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100 hover:border-emerald-200',
      dot: 'bg-emerald-500'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100 hover:border-amber-200',
      dot: 'bg-amber-500'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100 hover:border-rose-200',
      dot: 'bg-rose-500'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100 hover:border-purple-200',
      dot: 'bg-purple-500'
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`bg-white rounded-2xl p-6 border ${scheme.border} shadow-sm transition-all duration-200 hover:shadow-md relative overflow-hidden group`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${scheme.bg} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {badge && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center text-xs text-slate-500 gap-1.5">
          {trend && (
            <span className={`font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;
