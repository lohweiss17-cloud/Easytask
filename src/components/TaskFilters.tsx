import React from 'react';
import { Filter, X } from 'lucide-react';
import { FilterStatus, FilterPriority } from '../types';

interface TaskFiltersProps {
  statusFilter: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
  priorityFilter: FilterPriority;
  onPriorityChange: (priority: FilterPriority) => void;
  counts: {
    total: number;
    pending: number;
    completed: number;
  };
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  darkMode?: boolean;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  counts,
  hasActiveFilters,
  onResetFilters,
  darkMode = true,
}) => {
  return (
    <div
      id="task-filters-container"
      className={`p-4 rounded-2xl border transition-colors ${
        darkMode ? 'bg-stone-900/60 border-stone-800' : 'bg-white border-stone-200 shadow-xs'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filtro por Status (Abas) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span
            id="status-filter-label"
            className={`text-xs font-medium ${
              darkMode ? 'text-stone-400' : 'text-stone-500'
            }`}
          >
            Status:
          </span>
          <div
            id="status-filter-group"
            role="group"
            aria-labelledby="status-filter-label"
            className={`inline-flex p-1 rounded-xl text-xs font-medium border ${
              darkMode ? 'bg-stone-950 border-stone-800' : 'bg-stone-100 border-stone-200'
            }`}
          >
            <button
              id="filter-status-todas"
              type="button"
              onClick={() => onStatusChange('todas')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-stone-400 ${
                statusFilter === 'todas'
                  ? darkMode
                    ? 'bg-stone-800 text-stone-100 shadow-xs'
                    : 'bg-white text-stone-900 shadow-xs'
                  : darkMode
                    ? 'text-stone-400 hover:text-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Todas ({counts.total})
            </button>

            <button
              id="filter-status-pendentes"
              type="button"
              onClick={() => onStatusChange('pendentes')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-stone-400 ${
                statusFilter === 'pendentes'
                  ? darkMode
                    ? 'bg-stone-800 text-stone-100 shadow-xs'
                    : 'bg-white text-stone-900 shadow-xs'
                  : darkMode
                    ? 'text-stone-400 hover:text-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pendentes ({counts.pending})
            </button>

            <button
              id="filter-status-concluidas"
              type="button"
              onClick={() => onStatusChange('concluidas')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-stone-400 ${
                statusFilter === 'concluidas'
                  ? darkMode
                    ? 'bg-stone-800 text-stone-100 shadow-xs'
                    : 'bg-white text-stone-900 shadow-xs'
                  : darkMode
                    ? 'text-stone-400 hover:text-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Concluídas ({counts.completed})
            </button>
          </div>
        </div>

        {/* Filtro por Prioridade e Botão Reset */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="priority-filter-select"
              className={`text-xs font-medium shrink-0 ${
                darkMode ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              Prioridade:
            </label>
            <div className="relative inline-flex items-center">
              <Filter
                className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none ${
                  darkMode ? 'text-stone-400' : 'text-stone-500'
                }`}
              />
              <select
                id="priority-filter-select"
                value={priorityFilter}
                onChange={(e) => onPriorityChange(e.target.value as FilterPriority)}
                className={`pl-7 pr-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 transition-colors border ${
                  darkMode
                    ? 'bg-stone-950 border-stone-800 text-stone-200 hover:border-stone-700'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
              >
                <option value="todas" className={darkMode ? 'bg-stone-900 text-stone-100' : 'bg-white text-stone-900'}>
                  Todas as prioridades
                </option>
                <option value="alta" className={darkMode ? 'bg-stone-900 text-stone-100' : 'bg-white text-stone-900'}>
                  Alta
                </option>
                <option value="media" className={darkMode ? 'bg-stone-900 text-stone-100' : 'bg-white text-stone-900'}>
                  Média
                </option>
                <option value="baixa" className={darkMode ? 'bg-stone-900 text-stone-100' : 'bg-white text-stone-900'}>
                  Baixa
                </option>
              </select>
            </div>
          </div>

          {/* Botão para limpar filtros caso haja algum filtro ativo */}
          {hasActiveFilters && (
            <button
              id="clear-all-filters-btn"
              type="button"
              onClick={onResetFilters}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                darkMode
                  ? 'bg-stone-800 border-stone-700 text-stone-300 hover:text-stone-100 hover:bg-stone-700'
                  : 'bg-stone-100 border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
              }`}
              title="Restaurar visualização para todas as tarefas"
            >
              <X className="w-3 h-3" />
              Limpar filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
