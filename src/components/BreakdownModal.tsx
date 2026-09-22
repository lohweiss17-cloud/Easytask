import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Task, Priority, SubtaskSuggestion } from '../types';

interface BreakdownModalProps {
  isOpen: boolean;
  originalTask: Task | null;
  initialSuggestions: { title: string; priority: Priority }[];
  onConfirm: (selectedSubtasks: { title: string; priority: Priority }[]) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
  darkMode?: boolean;
}

export const BreakdownModal: React.FC<BreakdownModalProps> = ({
  isOpen,
  originalTask,
  initialSuggestions,
  onConfirm,
  onClose,
  isSaving,
  darkMode = true,
}) => {
  const [items, setItems] = useState<SubtaskSuggestion[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inicializa a lista sempre que o modal abre com novas sugestões
  useEffect(() => {
    if (isOpen && initialSuggestions.length > 0) {
      setItems(
        initialSuggestions.map((sug, idx) => ({
          id: `sug-${idx}-${Date.now()}`,
          title: sug.title,
          priority: sug.priority,
          selected: true,
        }))
      );
      setErrorMsg(null);
    }
  }, [isOpen, initialSuggestions]);

  if (!isOpen || !originalTask) return null;

  const selectedCount = items.filter((item) => item.selected).length;

  const handleToggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleToggleSelectAll = () => {
    const allSelected = items.every((i) => i.selected);
    setItems((prev) => prev.map((item) => ({ ...item, selected: !allSelected })));
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title: newTitle } : item))
    );
  };

  const handlePriorityChange = (id: string, priority: Priority) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, priority } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirm = async () => {
    const validSelected = items
      .filter((item) => item.selected && item.title.trim().length > 0)
      .map((item) => ({
        title: item.title.trim(),
        priority: item.priority,
      }));

    if (validSelected.length === 0) {
      setErrorMsg('Selecione pelo menos uma subtarefa com título válido.');
      return;
    }

    try {
      await onConfirm(validSelected);
    } catch {
      setErrorMsg('Ocorreu um erro ao salvar as tarefas no banco de dados.');
    }
  };

  const priorityBadgeColors: Record<Priority, string> = {
    baixa: darkMode ? 'text-sky-300 bg-sky-950/60 border-sky-800' : 'text-sky-700 bg-sky-50 border-sky-200',
    media: darkMode ? 'text-amber-300 bg-amber-950/60 border-amber-800' : 'text-amber-700 bg-amber-50 border-amber-200',
    alta: darkMode ? 'text-rose-300 bg-rose-950/60 border-rose-800' : 'text-rose-700 bg-rose-50 border-rose-200',
  };

  return (
    <div
      id="breakdown-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="breakdown-modal-title"
    >
      <div
        id="breakdown-modal-card"
        className={`w-full max-w-lg rounded-2xl border shadow-xl flex flex-col max-h-[90vh] overflow-hidden transition-colors ${
          darkMode
            ? 'bg-stone-900 border-stone-800 text-stone-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Cabeçalho */}
        <div
          id="breakdown-modal-header"
          className={`px-5 py-4 border-b flex items-start justify-between gap-3 ${
            darkMode ? 'border-stone-800' : 'border-stone-100'
          }`}
        >
          <div className="space-y-1 pr-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-violet-600/20 text-violet-400 border border-violet-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 id="breakdown-modal-title" className="text-base font-bold">
                Passos Sugeridos com IA
              </h3>
            </div>
            <p
              id="breakdown-original-task"
              className={`text-xs truncate max-w-sm ${
                darkMode ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              Origem: <span className="font-semibold text-stone-200">{originalTask.title}</span>
            </p>
          </div>

          <button
            id="close-breakdown-modal-btn"
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              darkMode
                ? 'border-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-800'
                : 'border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-100'
            }`}
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mensagem de Erro local se houver */}
        {errorMsg && (
          <div
            id="breakdown-error-alert"
            className={`mx-5 mt-3 p-3 rounded-xl border flex items-center gap-2 text-xs ${
              darkMode
                ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Barra com Contador e Selecionar Tudo */}
        <div
          id="breakdown-control-bar"
          className={`px-5 py-2.5 flex items-center justify-between border-b text-xs ${
            darkMode ? 'border-stone-800/80 bg-stone-900/40 text-stone-400' : 'border-stone-100 bg-stone-50/70 text-stone-600'
          }`}
        >
          <span>
            {selectedCount} de {items.length} selecionadas para criar
          </span>
          <button
            id="toggle-all-subtasks-btn"
            type="button"
            onClick={handleToggleSelectAll}
            className="text-xs font-semibold hover:underline cursor-pointer text-violet-400"
          >
            {items.every((i) => i.selected) ? 'Desmarcar todas' : 'Selecionar todas'}
          </button>
        </div>

        {/* Lista de Sugestões com Scroll */}
        <div
          id="breakdown-items-list"
          className="p-5 overflow-y-auto space-y-3 flex-1"
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              id={`breakdown-item-${idx}`}
              className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                item.selected
                  ? darkMode
                    ? 'bg-stone-850/80 border-stone-700'
                    : 'bg-stone-50 border-stone-300'
                  : darkMode
                  ? 'bg-stone-900/30 border-stone-800/60 opacity-60'
                  : 'bg-stone-100/40 border-stone-200 opacity-60'
              }`}
            >
              {/* Checkbox */}
              <button
                id={`check-subtask-${idx}`}
                type="button"
                onClick={() => handleToggleSelect(item.id)}
                className={`w-5 h-5 mt-1 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  item.selected
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : darkMode
                    ? 'border-stone-600 bg-stone-800/50 hover:border-stone-500'
                    : 'border-stone-300 bg-white hover:border-stone-400'
                }`}
                aria-label={item.selected ? 'Desmarcar subtarefa' : 'Marcar subtarefa'}
              >
                {item.selected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              </button>

              {/* Título Editável e Prioridade */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <input
                  id={`subtask-title-input-${idx}`}
                  type="text"
                  value={item.title}
                  onChange={(e) => handleTitleChange(item.id, e.target.value)}
                  placeholder="Título da subtarefa..."
                  maxLength={120}
                  className={`w-full text-xs sm:text-sm font-medium rounded-lg px-2.5 py-1.5 border transition-colors focus:outline-hidden focus:ring-1 focus:ring-violet-500 ${
                    darkMode
                      ? 'bg-stone-900 border-stone-700 text-stone-100 placeholder-stone-500'
                      : 'bg-white border-stone-200 text-stone-900 placeholder-stone-400'
                  }`}
                />

                <div className="flex items-center gap-2">
                  <select
                    id={`subtask-priority-select-${idx}`}
                    value={item.priority}
                    onChange={(e) =>
                      handlePriorityChange(item.id, e.target.value as Priority)
                    }
                    className={`text-[11px] font-semibold rounded-md px-2 py-0.5 border cursor-pointer ${
                      priorityBadgeColors[item.priority]
                    }`}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              {/* Botão Remover item individual */}
              <button
                id={`remove-subtask-${idx}-btn`}
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className={`p-1.5 rounded-lg text-stone-500 hover:text-rose-500 hover:bg-stone-800/50 transition-colors cursor-pointer shrink-0 mt-0.5`}
                title="Remover sugestão"
                aria-label="Remover sugestão"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-xs text-center py-6 text-stone-400">
              Nenhuma subtarefa restante na lista.
            </p>
          )}
        </div>

        {/* Rodapé com Ações de Confirmação Humana */}
        <div
          id="breakdown-modal-footer"
          className={`px-5 py-4 border-t flex items-center justify-end gap-2.5 ${
            darkMode ? 'border-stone-800 bg-stone-900' : 'border-stone-100 bg-white'
          }`}
        >
          <button
            id="cancel-breakdown-btn"
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer ${
              darkMode
                ? 'border-stone-700 text-stone-300 hover:bg-stone-800'
                : 'border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            Cancelar
          </button>

          <button
            id="confirm-breakdown-btn"
            type="button"
            onClick={handleConfirm}
            disabled={isSaving || selectedCount === 0}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer ${
              selectedCount === 0 || isSaving
                ? 'bg-violet-600/50 text-white/60 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-500 text-white active:scale-98'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Criando tarefas...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {selectedCount === 1
                    ? 'Criar 1 tarefa'
                    : `Criar ${selectedCount} tarefas`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
