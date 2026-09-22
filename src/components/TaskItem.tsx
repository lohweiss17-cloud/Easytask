import React from 'react';
import { Trash2, Edit2, CheckCircle2, Circle, Calendar, Tag, Sparkles, Loader2 } from 'lucide-react';
import { Task, Priority } from '../types';

interface TaskItemProps {
  task: Task;
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  onBreakdownTask?: (task: Task) => void;
  isBreakingDown?: boolean;
  darkMode?: boolean;
}

const getPriorityConfig = (priority: Priority, darkMode: boolean) => {
  if (darkMode) {
    return {
      baixa: {
        label: 'Baixa',
        badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
        dotClass: 'bg-emerald-400',
      },
      media: {
        label: 'Média',
        badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
        dotClass: 'bg-amber-400',
      },
      alta: {
        label: 'Alta',
        badgeClass: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
        dotClass: 'bg-rose-400',
      },
    }[priority];
  }

  return {
    baixa: {
      label: 'Baixa',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
    },
    media: {
      label: 'Média',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500',
    },
    alta: {
      label: 'Alta',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-500',
    },
  }[priority];
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleTask,
  onEditTask,
  onRequestDelete,
  onBreakdownTask,
  isBreakingDown = false,
  darkMode = true,
}) => {
  const config = getPriorityConfig(task.priority, darkMode);

  // Formatar data limite para pt-BR se existir
  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  return (
    <li
      id={`task-item-${task.id}`}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border gap-3 transition-all duration-150 ${
        darkMode
          ? task.completed
            ? 'border-stone-800/70 bg-stone-900/40 opacity-60'
            : 'border-stone-800 bg-stone-900 hover:border-stone-700 hover:shadow-xs'
          : task.completed
            ? 'border-stone-200 bg-stone-50/70 opacity-75'
            : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs'
      }`}
    >
      {/* Lado Esquerdo: Checkbox + Título + Descrição + Metadados */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <button
          id={`task-toggle-${task.id}`}
          type="button"
          onClick={() => onToggleTask(task.id)}
          className={`mt-0.5 transition-colors shrink-0 cursor-pointer focus:outline-hidden ${
            darkMode
              ? 'text-stone-500 hover:text-stone-300'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          title={task.completed ? 'Reabrir tarefa' : 'Concluir tarefa'}
          aria-label={task.completed ? 'Reabrir tarefa' : 'Concluir tarefa'}
        >
          {task.completed ? (
            <CheckCircle2
              className={`w-5 h-5 ${
                darkMode
                  ? 'text-emerald-400 fill-emerald-950'
                  : 'text-emerald-600 fill-emerald-100'
              }`}
            />
          ) : (
            <Circle
              className={`w-5 h-5 ${
                darkMode
                  ? 'text-stone-500 hover:text-stone-300'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            />
          )}
        </button>

        <div className="space-y-1.5 min-w-0 flex-1">
          {/* Título */}
          <p
            id={`task-title-${task.id}`}
            className={`text-base font-semibold break-words transition-all ${
              darkMode
                ? task.completed
                  ? 'line-through text-stone-500 decoration-stone-600'
                  : 'text-stone-100'
                : task.completed
                  ? 'line-through text-stone-400 decoration-stone-300'
                  : 'text-stone-900'
            }`}
          >
            {task.title}
          </p>

          {/* Descrição Opcional */}
          {task.description && (
            <p
              id={`task-desc-${task.id}`}
              className={`text-sm break-words whitespace-pre-line ${
                darkMode
                  ? task.completed ? 'text-stone-500' : 'text-stone-400'
                  : task.completed ? 'text-stone-400' : 'text-stone-600'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Tags e Metadados (Categoria, Data Limite, Status) */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
            {/* Status */}
            <span
              id={`task-status-badge-${task.id}`}
              className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium border ${
                darkMode
                  ? task.completed
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900/60'
                    : 'bg-stone-800 text-stone-400 border-stone-700/60'
                  : task.completed
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              {task.completed ? 'Concluída' : 'Pendente'}
            </span>

            {/* Prioridade */}
            <span
              id={`task-priority-badge-${task.id}`}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border ${config.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
              {config.label}
            </span>

            {/* Categoria */}
            {task.category && (
              <span
                id={`task-category-badge-${task.id}`}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                  darkMode
                    ? 'bg-stone-800 text-stone-300 border-stone-700'
                    : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <Tag className={`w-3 h-3 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`} />
                {task.category}
              </span>
            )}

            {/* Data Limite */}
            {formattedDueDate && (
              <span
                id={`task-duedate-badge-${task.id}`}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                  darkMode
                    ? 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                    : 'bg-amber-50 text-amber-800 border-amber-200/60'
                }`}
              >
                <Calendar className={`w-3 h-3 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                {formattedDueDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lado Direito: Ações (Quebrar com IA, Editar, Excluir) */}
      <div
        className={`flex items-center justify-end gap-1.5 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 w-full sm:w-auto ${
          darkMode ? 'border-stone-800' : 'border-stone-100'
        }`}
      >
        {onBreakdownTask && !task.completed && (
          <button
            id={`task-breakdown-${task.id}`}
            type="button"
            onClick={() => onBreakdownTask(task)}
            disabled={isBreakingDown}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold border shadow-2xs ${
              darkMode
                ? 'bg-violet-950/40 text-violet-300 border-violet-800/60 hover:bg-violet-900/60 hover:text-violet-100 hover:border-violet-700'
                : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 hover:border-violet-300'
            } ${isBreakingDown ? 'opacity-70 cursor-not-allowed' : 'active:scale-98'}`}
            title="Quebrar tarefa com IA em passos menores"
            aria-label={`Quebrar tarefa ${task.title} com IA`}
          >
            {isBreakingDown ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            )}
            <span className="hidden xs:inline">
              {isBreakingDown ? 'Analisando...' : 'Quebrar com IA'}
            </span>
          </button>
        )}

        <button
          id={`task-edit-${task.id}`}
          type="button"
          onClick={() => onEditTask(task)}
          disabled={isBreakingDown}
          className={`p-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-medium ${
            darkMode
              ? 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
              : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
          } ${isBreakingDown ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Editar tarefa"
          aria-label={`Editar tarefa ${task.title}`}
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span className="sm:hidden">Editar</span>
        </button>

        <button
          id={`task-delete-${task.id}`}
          type="button"
          onClick={() => onRequestDelete(task)}
          disabled={isBreakingDown}
          className={`p-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-medium ${
            darkMode
              ? 'text-stone-400 hover:text-rose-400 hover:bg-rose-950/50'
              : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
          } ${isBreakingDown ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Excluir tarefa"
          aria-label={`Excluir tarefa ${task.title}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="sm:hidden">Excluir</span>
        </button>
      </div>
    </li>
  );
};
