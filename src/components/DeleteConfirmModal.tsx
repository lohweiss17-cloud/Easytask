import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
  darkMode?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  taskTitle,
  onConfirm,
  onCancel,
  isDeleting = false,
  darkMode = true,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="delete-modal-overlay"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs transition-opacity ${
        darkMode ? 'bg-black/75' : 'bg-stone-900/40'
      }`}
      onClick={isDeleting ? undefined : onCancel}
    >
      <div
        id="delete-modal-content"
        className={`rounded-2xl max-w-md w-full p-6 shadow-2xl border space-y-4 transition-colors ${
          darkMode
            ? 'bg-stone-900 border-stone-800 text-stone-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                darkMode
                  ? 'bg-rose-950/70 border-rose-800/60 text-rose-400'
                  : 'bg-rose-50 border-rose-200 text-rose-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="delete-modal-title"
                className={`text-lg font-semibold ${
                  darkMode ? 'text-stone-100' : 'text-stone-900'
                }`}
              >
                Confirmar Exclusão
              </h3>
              <p className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                Esta ação não poderá ser desfeita.
              </p>
            </div>
          </div>
          <button
            id="delete-modal-close-btn"
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              darkMode
                ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
            }`}
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className={`text-sm ${darkMode ? 'text-stone-300' : 'text-stone-600'}`}>
          Você tem certeza que deseja excluir a tarefa{' '}
          <strong className={`font-semibold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
            "{taskTitle}"
          </strong>?
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            id="delete-modal-cancel-btn"
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              darkMode
                ? 'text-stone-300 bg-stone-800 hover:bg-stone-700'
                : 'text-stone-700 bg-stone-100 hover:bg-stone-200'
            }`}
          >
            Cancelar
          </button>
          <button
            id="delete-modal-confirm-btn"
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg transition-all shadow-xs ${
              isDeleting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Sim, Excluir'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
