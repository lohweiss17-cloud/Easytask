import React, { useState } from 'react';
import { PlusCircle, AlertCircle, ChevronDown, ChevronUp, FileText, Tag, Calendar, Loader2 } from 'lucide-react';
import { Priority, TaskFormData } from '../types';

interface TaskFormProps {
  onAddTask: (data: TaskFormData) => Promise<boolean> | void;
  isSubmitting?: boolean;
  darkMode?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  onAddTask,
  isSubmitting = false,
  darkMode = true,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('O título da tarefa é obrigatório.');
      return;
    }

    const success = await onAddTask({
      title: trimmedTitle,
      description: description.trim() || undefined,
      priority,
      category: category.trim() || undefined,
      dueDate: dueDate || undefined,
    });

    // Se o salvamento for bem-sucedido (ou não retornar falso), limpa os campos.
    // Se a gravação falhar, os dados digitados são mantidos intactos!
    if (success !== false) {
      setTitle('');
      setDescription('');
      setPriority('media');
      setCategory('');
      setDueDate('');
      setError('');
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (error && e.target.value.trim()) {
      setError('');
    }
  };

  return (
    <div
      id="task-form-card"
      className={`rounded-2xl p-6 shadow-xs border transition-colors duration-200 ${
        darkMode
          ? 'bg-stone-900 border-stone-800'
          : 'bg-white border-stone-200 shadow-stone-100'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          id="task-form-title"
          className={`text-lg font-semibold flex items-center gap-2 ${
            darkMode ? 'text-stone-100' : 'text-stone-900'
          }`}
        >
          <PlusCircle className={`w-5 h-5 ${darkMode ? 'text-stone-300' : 'text-stone-700'}`} />
          Nova Tarefa
        </h2>
        <button
          id="toggle-optional-fields-btn"
          type="button"
          onClick={() => setShowOptionalFields(!showOptionalFields)}
          className={`text-xs font-medium inline-flex items-center gap-1 py-1 px-2.5 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 ${
            darkMode
              ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          {showOptionalFields ? (
            <>
              Menos campos <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Mais detalhes opcionais <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Título (Obrigatório) */}
        <div>
          <label
            htmlFor="task-title-input"
            className={`block text-sm font-medium mb-1 ${
              darkMode ? 'text-stone-200' : 'text-stone-700'
            }`}
          >
            Título da tarefa <span className={darkMode ? 'text-rose-400' : 'text-rose-500'}>*</span>
          </label>
          <input
            id="task-title-input"
            type="text"
            value={title}
            onChange={handleTitleChange}
            disabled={isSubmitting}
            placeholder="Ex: Comprar mantimentos, pagar conta de luz..."
            aria-required="true"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'task-title-error' : undefined}
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
            } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
          {error && (
            <p
              id="task-title-error"
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
            id="task-priority-label"
            className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-stone-200' : 'text-stone-700'
            }`}
          >
            Prioridade
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3" role="radiogroup" aria-labelledby="task-priority-label">
            <button
              id="priority-btn-baixa"
              type="button"
              role="radio"
              aria-checked={priority === 'baixa'}
              disabled={isSubmitting}
              onClick={() => setPriority('baixa')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium border transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 ${
                darkMode
                  ? priority === 'baixa'
                    ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-300 shadow-xs'
                    : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                  : priority === 'baixa'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
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
              id="priority-btn-media"
              type="button"
              role="radio"
              aria-checked={priority === 'media'}
              disabled={isSubmitting}
              onClick={() => setPriority('media')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium border transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 ${
                darkMode
                  ? priority === 'media'
                    ? 'bg-amber-950/70 border-amber-500/70 text-amber-300 shadow-xs'
                    : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                  : priority === 'media'
                    ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
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
              id="priority-btn-alta"
              type="button"
              role="radio"
              aria-checked={priority === 'alta'}
              disabled={isSubmitting}
              onClick={() => setPriority('alta')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium border transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 ${
                darkMode
                  ? priority === 'alta'
                    ? 'bg-rose-950/70 border-rose-500/70 text-rose-300 shadow-xs'
                    : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                  : priority === 'alta'
                    ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
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

        {/* Campos Opcionais (Descrição, Categoria, Data Limite) */}
        {showOptionalFields && (
          <div
            className={`space-y-3 pt-2 border-t ${
              darkMode ? 'border-stone-800' : 'border-stone-100'
            }`}
          >
            {/* Descrição Opcional */}
            <div>
              <label
                htmlFor="task-description-input"
                className={`block text-xs font-medium mb-1 flex items-center gap-1 ${
                  darkMode ? 'text-stone-300' : 'text-stone-600'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 ${darkMode ? 'text-stone-400' : 'text-stone-400'}`} />
                Descrição <span className={darkMode ? 'text-stone-500' : 'text-stone-400'}>(opcional)</span>
              </label>
              <textarea
                id="task-description-input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                placeholder="Detalhes ou anotações adicionais..."
                className={`w-full px-3.5 py-2 rounded-lg border text-sm resize-none focus:outline-hidden transition-colors ${
                  darkMode
                    ? 'border-stone-800 text-stone-100 placeholder-stone-500 bg-stone-950/60 focus:bg-stone-950 focus:border-stone-600 focus:ring-2 focus:ring-stone-800'
                    : 'border-stone-300 text-stone-800 placeholder-stone-400 bg-stone-50/50 focus:bg-white focus:border-stone-600 focus:ring-2 focus:ring-stone-100'
                } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Categoria Opcional */}
              <div>
                <label
                  htmlFor="task-category-input"
                  className={`block text-xs font-medium mb-1 flex items-center gap-1 ${
                    darkMode ? 'text-stone-300' : 'text-stone-600'
                  }`}
                >
                  <Tag className={`w-3.5 h-3.5 ${darkMode ? 'text-stone-400' : 'text-stone-400'}`} />
                  Categoria <span className={darkMode ? 'text-stone-500' : 'text-stone-400'}>(opcional)</span>
                </label>
                <input
                  id="task-category-input"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Ex: Trabalho, Casa, Estudos..."
                  className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-hidden transition-colors ${
                    darkMode
                      ? 'border-stone-800 text-stone-100 placeholder-stone-500 bg-stone-950/60 focus:bg-stone-950 focus:border-stone-600 focus:ring-2 focus:ring-stone-800'
                      : 'border-stone-300 text-stone-800 placeholder-stone-400 bg-stone-50/50 focus:bg-white focus:border-stone-600 focus:ring-2 focus:ring-stone-100'
                  } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Data Limite Opcional */}
              <div>
                <label
                  htmlFor="task-duedate-input"
                  className={`block text-xs font-medium mb-1 flex items-center gap-1 ${
                    darkMode ? 'text-stone-300' : 'text-stone-600'
                  }`}
                >
                  <Calendar className={`w-3.5 h-3.5 ${darkMode ? 'text-stone-400' : 'text-stone-400'}`} />
                  Data Limite <span className={darkMode ? 'text-stone-500' : 'text-stone-400'}>(opcional)</span>
                </label>
                <input
                  id="task-duedate-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-hidden transition-colors ${
                    darkMode
                      ? 'border-stone-800 text-stone-100 bg-stone-950/60 focus:bg-stone-950 focus:border-stone-600 focus:ring-2 focus:ring-stone-800'
                      : 'border-stone-300 text-stone-800 bg-stone-50/50 focus:bg-white focus:border-stone-600 focus:ring-2 focus:ring-stone-100'
                  } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Botão de Ação Principal Facilmente Identificável */}
        <div className="pt-2 flex justify-end">
          <button
            id="task-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 font-medium px-6 py-2.5 rounded-xl transition-all shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 ${
              isSubmitting
                ? 'opacity-70 cursor-not-allowed'
                : 'cursor-pointer'
            } ${
              darkMode
                ? 'bg-stone-100 text-stone-900 hover:bg-stone-200 active:bg-stone-300'
                : 'bg-stone-900 text-white hover:bg-stone-800 active:bg-stone-950'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Cadastrar Tarefa
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
