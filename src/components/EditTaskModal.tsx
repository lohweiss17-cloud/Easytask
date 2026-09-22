import React, { useState, useEffect } from 'react';
import { Edit3, X, AlertCircle, Calendar, Tag, FileText, Loader2 } from 'lucide-react';
import { Task, Priority, TaskFormData } from '../types';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onSave: (id: string, data: TaskFormData) => Promise<boolean> | void;
  onClose: () => void;
  isSaving?: boolean;
  darkMode?: boolean;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onSave,
  onClose,
  isSaving = false,
  darkMode = true,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'media');
      setCategory(task.category || '');
      setDueDate(task.dueDate || '');
      setError('');
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('O título da tarefa é obrigatório.');
      return;
    }

    const success = await onSave(task.id, {
      title: trimmedTitle,
      description: description.trim() || undefined,
      priority,
      category: category.trim() || undefined,
      dueDate: dueDate || undefined,
    });

    if (success !== false) {
      onClose();
    }
  };

  return (
    <div
      id="edit-modal-overlay"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto ${
        darkMode ? 'bg-black/75' : 'bg-stone-900/40'
      }`}
      onClick={isSaving ? undefined : onClose}
    >
      <div
        id="edit-modal-content"
        className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl border my-8 space-y-4 transition-colors ${
          darkMode
            ? 'bg-stone-900 border-stone-800 text-stone-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        <div
          className={`flex items-center justify-between pb-3 border-b ${
            darkMode ? 'border-stone-800' : 'border-stone-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                darkMode ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-700'
              }`}
            >
              <Edit3 className="w-4 h-4" />
            </div>
            <h3
              id="edit-modal-title"
              className={`text-lg font-semibold ${
                darkMode ? 'text-stone-100' : 'text-stone-900'
              }`}
            >
              Editar Tarefa
            </h3>
          </div>
          <button
            id="edit-modal-close-btn"
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              darkMode
                ? 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
            }`}
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="edit-task-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Título (Obrigatório) */}
          <div>
            <label
              htmlFor="edit-task-title-input"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? 'text-stone-200' : 'text-stone-700'
              }`}
            >
              Título da tarefa <span className={darkMode ? 'text-rose-400' : 'text-rose-500'}>*</span>
            </label>
            <input
              id="edit-task-title-input"
              type="text"
              value={title}
              disabled={isSaving}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error && e.target.value.trim()) setError('');
              }}
              placeholder="Ex: Título da tarefa..."
              aria-required="true"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'edit-task-title-error' : undefined}
              className={`w-full px-4 py-2.5 rounded-xl border focus:outline-hidden transition-colors ${
                darkMode
                  ? `text-stone-100 placeholder-stone-500 bg-stone-950/60 ${
                      error
                        ? 'border-rose-500/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-950'
                        : 'border-stone-800 focus:border-stone-600 focus:ring-2 focus:ring-stone-800'
                    }`
                  : `text-stone-800 placeholder-stone-400 bg-stone-50/50 focus:bg-white ${
                      error
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                        : 'border-stone-300 focus:border-stone-600 focus:ring-2 focus:ring-stone-100'
                    }`
              } ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
            {error && (
              <p
                id="edit-task-title-error"
                className={`mt-1.5 text-xs flex items-center gap-1 font-medium ${
                  darkMode ? 'text-rose-400' : 'text-rose-600'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          {/* Prioridade */}
          <div>
            <label
              id="edit-task-priority-label"
              className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-stone-200' : 'text-stone-700'
              }`}
            >
              Prioridade
            </label>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="edit-task-priority-label">
              <button
                id="edit-priority-btn-baixa"
                type="button"
                role="radio"
                aria-checked={priority === 'baixa'}
                disabled={isSaving}
                onClick={() => setPriority('baixa')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium border transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 ${
                  darkMode
                    ? priority === 'baixa'
                      ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-300 shadow-xs'
                      : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                    : priority === 'baixa'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    priority === 'baixa'
                      ? darkMode ? 'bg-emerald-400' : 'bg-emerald-600'
                      : darkMode ? 'bg-emerald-500/60' : 'bg-emerald-400'
                  }`}
                />
                Baixa
              </button>

              <button
                id="edit-priority-btn-media"
                type="button"
                role="radio"
                aria-checked={priority === 'media'}
                disabled={isSaving}
                onClick={() => setPriority('media')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium border transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 ${
                  darkMode
                    ? priority === 'media'
                      ? 'bg-amber-950/70 border-amber-500/70 text-amber-300 shadow-xs'
                    : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                    : priority === 'media'
                      ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    priority === 'media'
                      ? darkMode ? 'bg-amber-400' : 'bg-amber-600'
                      : darkMode ? 'bg-amber-500/60' : 'bg-amber-400'
                  }`}
                />
                Média
              </button>

              <button
                id="edit-priority-btn-alta"
                type="button"
                role="radio"
                aria-checked={priority === 'alta'}
                disabled={isSaving}
                onClick={() => setPriority('alta')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium border transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 ${
                  darkMode
                    ? priority === 'alta'
                      ? 'bg-rose-950/70 border-rose-500/70 text-rose-300 shadow-xs'
                      : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                    : priority === 'alta'
                      ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    priority === 'alta'
                      ? darkMode ? 'bg-rose-400' : 'bg-rose-600'
                      : darkMode ? 'bg-rose-500/60' : 'bg-rose-400'
                  }`}
                />
                Alta
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label
              htmlFor="edit-task-description-input"
              className={`block text-sm font-medium mb-1 flex items-center gap-1 ${
                darkMode ? 'text-stone-200' : 'text-stone-700'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${darkMode ? 'text-stone-400' : 'text-stone-400'}`} />
              Descrição <span className={`text-xs font-normal ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>(opcional)</span>
            </label>
            <textarea
              id="edit-task-description-input"
              rows={3}
              value={description}
              disabled={isSaving}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais sobre a tarefa..."
              className={`w-full px-3.5 py-2 rounded-lg border text-sm resize-none focus:outline-hidden transition-colors ${
                darkMode
                  ? 'border-stone-800 text-stone-100 placeholder-stone-500 bg-stone-950/60 focus:bg-stone-950 focus:border-stone-600 focus:ring-2 focus:ring-stone-800'
                  : 'border-stone-300 text-stone-800 placeholder-stone-400 bg-stone-50/50 focus:bg-white focus:border-stone-600 focus:ring-2 focus:ring-stone-100'
              } ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Categoria */}
            <div>
              <label
                htmlFor="edit-task-category-input"
                className={`block text-sm font-medium mb-1 flex items-center gap-1 ${
                  darkMode ? 'text-stone-200' : 'text-stone-700'
                }`}
              >
                <Tag className={`w-3.5 h-3.5 ${darkMode ? 'text-stone-400' : 'text-stone-400'}`} />
                Categoria <span className={`text-xs font-normal ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>(opcional)</span>
              </label>
              <input
                id="edit-task-category-input"
                type="text"
                value={category}
                disabled={isSaving}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Trabalho, Casa..."
                className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-hidden transition-colors ${
                  darkMode
                    ? 'border-stone-800 text-stone-100 placeholder-stone-500 bg-stone-950/60 focus:bg-stone-950 focus:border-stone-600 focus:ring-2 focus:ring-stone-800'
                    : 'border-stone-300 text-stone-800 placeholder-stone-400 bg-stone-50/50 focus:bg-white focus:border-stone-600 focus:ring-2 focus:ring-stone-100'
                } ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Data Limite */}
            <div>
              <label
                htmlFor="edit-task-duedate-input"
                className={`block text-sm font-medium mb-1 flex items-center gap-1 ${
                  darkMode ? 'text-stone-200' : 'text-stone-700'
                }`}
              >
                <Calendar className={`w-3.5 h-3.5 ${darkMode ? 'text-stone-400' : 'text-stone-400'}`} />
                Data Limite <span className={`text-xs font-normal ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>(opcional)</span>
              </label>
              <input
                id="edit-task-duedate-input"
                type="date"
                value={dueDate}
                disabled={isSaving}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-hidden transition-colors ${
                  darkMode
                    ? 'border-stone-800 text-stone-100 bg-stone-950/60 focus:bg-stone-950 focus:border-stone-600 focus:ring-2 focus:ring-stone-800'
                    : 'border-stone-300 text-stone-800 bg-stone-50/50 focus:bg-white focus:border-stone-600 focus:ring-2 focus:ring-stone-100'
                } ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div
            className={`flex items-center justify-end gap-2.5 pt-3 border-t ${
              darkMode ? 'border-stone-800' : 'border-stone-100'
            }`}
          >
            <button
              id="edit-task-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                darkMode
                  ? 'text-stone-300 bg-stone-800 hover:bg-stone-700'
                  : 'text-stone-700 bg-stone-100 hover:bg-stone-200'
              }`}
            >
              Cancelar
            </button>
            <button
              id="edit-task-save-btn"
              type="submit"
              disabled={isSaving}
              className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all shadow-xs ${
                isSaving ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              } ${
                darkMode
                  ? 'text-stone-900 bg-stone-100 hover:bg-stone-200 active:bg-stone-300'
                  : 'text-white bg-stone-900 hover:bg-stone-800 active:bg-stone-950'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
