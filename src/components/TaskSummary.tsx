import React from 'react';
import { ClipboardList, Clock, CheckCircle2 } from 'lucide-react';
import { FilterStatus } from '../types';

interface TaskSummaryProps {
  total: number;
  pending: number;
  completed: number;
  currentFilter?: FilterStatus;
  onSelectFilter?: (status: FilterStatus) => void;
  darkMode?: boolean;
}

export const TaskSummary: React.FC<TaskSummaryProps> = ({
  total,
  pending,
  completed,
  currentFilter,
  onSelectFilter,
  darkMode = true,
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const items: Array<{
    id: FilterStatus;
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    borderActive: string;
  }> = [
    {
      id: 'todas',
      label: 'Total de Tarefas',
      count: total,
      icon: ClipboardList,
      accentColor: darkMode ? 'text-stone-300' : 'text-stone-700',
      borderActive: darkMode ? 'border-stone-500 bg-stone-900/90' : 'border-stone-400 bg-stone-50',
    },
    {
      id: 'pendentes',
      label: 'Pendentes',
      count: pending,
      icon: Clock,
      accentColor: darkMode ? 'text-amber-400' : 'text-amber-600',
      borderActive: darkMode ? 'border-amber-500/70 bg-stone-900/90' : 'border-amber-400 bg-amber-50/50',
    },
    {
      id: 'concluidas',
      label: 'Concluídas',
      count: completed,
      icon: CheckCircle2,
      accentColor: darkMode ? 'text-emerald-400' : 'text-emerald-600',
      borderActive: darkMode ? 'border-emerald-500/70 bg-stone-900/90' : 'border-emerald-400 bg-emerald-50/50',
    },
  ];

  return (
    <section aria-label="Resumo geral de tarefas" className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentFilter === item.id;
          const isInteractive = Boolean(onSelectFilter);

          return (
            <button
              key={item.id}
              type="button"
              disabled={!isInteractive}
              onClick={() => onSelectFilter && onSelectFilter(item.id)}
              className={`text-left p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between ${
                isInteractive ? 'cursor-pointer hover:shadow-xs focus-visible:ring-2 focus-visible:ring-stone-400' : ''
              } ${
                isActive
                  ? item.borderActive
                  : darkMode
                    ? 'bg-stone-900/70 border-stone-800 hover:border-stone-700'
                    : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <div>
                <span
                  className={`block text-xs font-medium ${
                    darkMode ? 'text-stone-400' : 'text-stone-500'
                  }`}
                >
                  {item.label}
                </span>
                <span
                  className={`text-2xl font-bold tracking-tight mt-0.5 block ${
                    darkMode ? 'text-stone-100' : 'text-stone-900'
                  }`}
                >
                  {item.count}
                </span>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  darkMode ? 'bg-stone-800/80' : 'bg-stone-100'
                } ${item.accentColor}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Barra de Progresso Visual */}
      {total > 0 && (
        <div
          className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors ${
            darkMode ? 'bg-stone-900/40 border-stone-800/80 text-stone-400' : 'bg-stone-100/70 border-stone-200 text-stone-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-300 dark:text-stone-300">
              Progresso geral:
            </span>
            <span>
              {completed} de {total} concluída{total === 1 ? '' : 's'} ({percentage}%)
            </span>
          </div>
          <div
            className={`w-full sm:w-48 h-2 rounded-full overflow-hidden ${
              darkMode ? 'bg-stone-800' : 'bg-stone-200'
            }`}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso de tarefas concluídas"
          >
            <div
              className="h-full bg-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
};
