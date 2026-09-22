import React from 'react';
import { LogIn, Shield, CheckCircle2, Cloud, Loader2 } from 'lucide-react';

interface WelcomeStateProps {
  onLoginWithGoogle: () => void;
  isLoggingIn?: boolean;
  darkMode?: boolean;
}

export const WelcomeState: React.FC<WelcomeStateProps> = ({
  onLoginWithGoogle,
  isLoggingIn = false,
  darkMode = true,
}) => {
  return (
    <div
      id="welcome-card"
      className={`rounded-2xl border p-6 sm:p-10 text-center transition-colors shadow-sm space-y-6 ${
        darkMode
          ? 'bg-stone-900/60 border-stone-800'
          : 'bg-white border-stone-200'
      }`}
    >
      <div className="max-w-md mx-auto space-y-3">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border transition-colors ${
            darkMode
              ? 'bg-stone-800/80 border-stone-700 text-stone-100'
              : 'bg-stone-100 border-stone-200 text-stone-900'
          }`}
        >
          <Shield className="w-7 h-7 text-emerald-500" />
        </div>
        <h2
          id="welcome-title"
          className={`text-xl sm:text-2xl font-bold tracking-tight ${
            darkMode ? 'text-stone-100' : 'text-stone-900'
          }`}
        >
          Suas tarefas, salvas com privacidade
        </h2>
        <p
          id="welcome-subtitle"
          className={`text-sm ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}
        >
          Conecte sua conta Google para acessar seu espaço pessoal de tarefas. Cada usuário possui seus dados isolados e protegidos por regras de segurança no Cloud Firestore.
        </p>
      </div>

      {/* Botão de Ação Principal: Entrar com Google */}
      <div className="pt-2">
        <button
          id="welcome-google-login-btn"
          type="button"
          onClick={onLoginWithGoogle}
          disabled={isLoggingIn}
          className={`inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-md active:scale-98 ${
            darkMode
              ? 'bg-stone-100 hover:bg-white text-stone-900 hover:shadow-stone-700/20'
              : 'bg-stone-900 hover:bg-stone-800 text-white hover:shadow-stone-900/20'
          } ${isLoggingIn ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Conectando com o Google...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 text-emerald-500" />
              <span>Entrar com conta Google</span>
            </>
          )}
        </button>
      </div>

      {/* Benefícios e Isolamento de Dados */}
      <div
        id="welcome-features"
        className={`grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t text-left ${
          darkMode ? 'border-stone-800/80 text-stone-300' : 'border-stone-100 text-stone-700'
        }`}
      >
        <div className="flex items-start gap-2.5 p-3 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold">Espaço Privado</p>
            <p className={`mt-0.5 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              Suas tarefas só podem ser vistas e editadas por você.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl">
          <Cloud className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold">Nuvem em Tempo Real</p>
            <p className={`mt-0.5 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              Sincronização imediata no Firestore em qualquer dispositivo.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl">
          <Shield className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold">Segurança no Backend</p>
            <p className={`mt-0.5 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              Regras do Firestore que impedem acessos não autorizados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
