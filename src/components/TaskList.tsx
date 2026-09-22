import React from 'react';
import { ClipboardList, CheckCheck, Inbox, SearchX, Loader2 } from 'lucide-react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  totalTasksCount: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  onBreakdownTask?: (task: Task) => void;
  breakingDownTaskId?: string | null;
  onClearCompleted?: () => void;
  completedTasksCount: number;
  isLoading?: boolean;
  darkMode?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  totalTasksCount,
  hasActiveFilters,
  onResetFilters,
  onToggleTask,
  onEditTask,
  onRequestDelete,
  onBreakdownTask,
  breakingDownTaskId = null,
  onClearCompleted,
  completedTasksCount,
  isLoading = false,
  darkMode = true,
}) => {
  return (
    <div id="task-list-section" className="space-y-4">
      {/* Cabeçalho da Lista */}
      <div id="task-list-header" className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <h2
            id="task-list-title"
            className={`text-lg font-semibold flex items-center gap-2 ${
              darkMode ? 'text-stone-100' : 'text-stone-900'
            }`}
          >
            <ClipboardList className={`w-5 h-5 ${darkMode ? 'text-stone-300' : 'text-stone-700'}`} />
            Tarefas
          </h2>
          <span
            id="task-count-badge"
            className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
              darkMode
                ? 'bg-stone-800 border-stone-700 text-stone-300'
                : 'bg-stone-200 border-stone-300 text-stone-700'
            }`}
            title={`${tasks.length} tarefa(s) exibida(s)`}
          >
            {isLoading ? '...' : tasks.length}
            {!isLoading && totalTasksCount !== tasks.length && ` de ${totalTasksCount}`}
          </span>
        </div>

        {!isLoading && completedTasksCount > 0 && onClearCompleted && (
          <button
            id="clear-completed-btn-header"
            type="button"
            onClick={onClearCompleted}
            className={`text-xs font-medium inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer border ${
              darkMode
                ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-stone-800'
                : 'bg-white border-stone-200 text-stone-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Limpar concluídas ({completedTasksCount})
          </button>
        )}
      </div>

      {/* Estado de Carregamento */}
      {isLoading && (
        <div
          id="task-loading-state"
          className={`border rounded-2xl p-10 text-center transition-colors ${
            darkMode
              ? 'bg-stone-900/40 border-stone-800 text-stone-400'
              : 'bg-white border-stone-200 text-stone-500'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border ${
              darkMode
                ? 'bg-stone-800/80 border-stone-700 text-stone-300'
                : 'bg-stone-100 border-stone-200 text-stone-600'
            }`}
          >
            <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
          </div>
          <h3 className={`font-semibold text-base mb-1 ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
            Carregando tarefas...
          </h3>
          <p className={`text-xs max-w-sm mx-auto ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
            Sincronizando com o Cloud Firestore
          </p>
        </div>
      )}

      {/* Estado Vazio 1: Nenhuma tarefa criada no sistema */}
      {!isLoading && totalTasksCount === 0 && (
        <div
          id="task-empty-state"
          className={`border border-dashed rounded-2xl p-8 text-center transition-colors ${
            darkMode
              ? 'bg-stone-900/40 border-stone-800 text-stone-400'
              : 'bg-white border-stone-300 text-stone-500'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border ${
              darkMode
                ? 'bg-stone-800/80 border-stone-700 text-stone-300'
                : 'bg-stone-100 border-stone-200 text-stone-600'
            }`}
          >
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className={`font-semibold text-base mb-1 ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
            Nenhuma tarefa cadastrada
          </h3>
          <p className={`text-sm max-w-sm mx-auto ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
            Você ainda não tem tarefas salvas no Firestore. Preencha o formulário acima para adicionar sua primeira tarefa.
          </p>
        </div>
      )}

      {/* Estado Vazio 2: Nenhuma tarefa corresponde aos filtros aplicados */}
      {!isLoading && totalTasksCount > 0 && tasks.length === 0 && (
        <div
          id="task-filtered-empty-state"
          className={`border rounded-2xl p-8 text-center transition-colors ${
            darkMode
              ? 'bg-stone-900/60 border-stone-800'
              : 'bg-white border-stone-200'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border ${
              darkMode
                ? 'bg-stone-800/80 border-stone-700 text-stone-300'
                : 'bg-stone-100 border-stone-200 text-stone-600'
            }`}
          >
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className={`font-semibold text-base mb-1 ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
            Nenhuma tarefa encontrada
          </h3>
          <p className={`text-sm max-w-sm mx-auto mb-4 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
            Nenhuma tarefa corresponde aos filtros selecionados de status ou prioridade.
          </p>
          <button
            id="reset-filters-btn"
            type="button"
            onClick={onResetFilters}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border shadow-xs ${
              darkMode
                ? 'bg-stone-800 border-stone-700 text-stone-100 hover:bg-stone-750'
                : 'bg-stone-900 border-stone-800 text-white hover:bg-stone-800'
            }`}
          >
            Limpar filtros e exibir todas
          </button>
        </div>
      )}

      {/* Lista de Tarefas */}
      {!isLoading && tasks.length > 0 && (
        <ul id="task-list" className="space-y-2.5" aria-label="Lista de tarefas">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleTask={onToggleTask}
              onEditTask={onEditTask}
              onRequestDelete={onRequestDelete}
              onBreakdownTask={onBreakdownTask}
              isBreakingDown={breakingDownTaskId === task.id}
              darkMode={darkMode}
            />
          ))}
        </ul>
      )}

      {/* Rodapé com Resumo de Progresso */}
      {!isLoading && totalTasksCount > 0 && tasks.length > 0 && (
        <div
          id="task-list-footer"
          className={`flex items-center justify-between text-xs pt-2 px-1 ${
            darkMode ? 'text-stone-400' : 'text-stone-500'
          }`}
        >
          <p id="task-progress-summary">
            Mostrando {tasks.length} de {totalTasksCount} tarefa{totalTasksCount === 1 ? '' : 's'}
          </p>
          {completedTasksCount > 0 && (
            <p className="text-emerald-500 font-medium">
              {completedTasksCount} concluída{completedTasksCount === 1 ? '' : 's'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
