import React, { useState } from 'react';
import { LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import { User } from 'firebase/auth';

interface UserAuthBarProps {
  currentUser: User | null;
  onLoginWithGoogle: () => void;
  onLogout: () => void;
  isLoggingIn?: boolean;
  isLoggingOut?: boolean;
  darkMode?: boolean;
}

export const UserAuthBar: React.FC<UserAuthBarProps> = ({
  currentUser,
  onLoginWithGoogle,
  onLogout,
  isLoggingIn = false,
  isLoggingOut = false,
  darkMode = true,
}) => {
  const [imgError, setImgError] = useState(false);

  if (!currentUser) {
    return (
      <button
        id="google-login-btn"
        type="button"
        onClick={onLoginWithGoogle}
        disabled={isLoggingIn}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border shadow-xs active:scale-98 ${
          darkMode
            ? 'bg-stone-850 hover:bg-stone-800 text-stone-100 border-stone-700'
            : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300'
        } ${isLoggingIn ? 'opacity-75 cursor-not-allowed' : ''}`}
        aria-label="Entrar com conta Google"
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
            <span>Conectando...</span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 text-emerald-500" />
            <span>Entrar com Google</span>
          </>
        )}
      </button>
    );
  }

  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuário';
  const initial = (displayName.charAt(0) || 'U').toUpperCase();

  return (
    <div
      id="user-profile-bar"
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-colors shadow-xs ${
        darkMode
          ? 'bg-stone-900 border-stone-800 text-stone-200'
          : 'bg-white border-stone-200 text-stone-800'
      }`}
    >
      {/* Avatar / Foto */}
      <div className="relative shrink-0">
        {currentUser.photoURL && !imgError ? (
          <img
            id="user-avatar-img"
            src={currentUser.photoURL}
            alt={displayName}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-7 h-7 rounded-full object-cover border border-stone-700/50"
          />
        ) : (
          <div
            id="user-avatar-fallback"
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              darkMode
                ? 'bg-stone-800 text-stone-300 border border-stone-700'
                : 'bg-stone-200 text-stone-700 border border-stone-300'
            }`}
          >
            {initial}
          </div>
        )}
      </div>

      {/* Nome e E-mail */}
      <div className="text-left hidden sm:block max-w-[140px] truncate leading-tight">
        <p id="user-display-name" className="text-xs font-semibold truncate">
          {displayName}
        </p>
        {currentUser.email && (
          <p
            id="user-email"
            className={`text-[10px] truncate ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}
          >
            {currentUser.email}
          </p>
        )}
      </div>

      {/* Botão Sair */}
      <button
        id="logout-btn"
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ml-1 ${
          darkMode
            ? 'text-stone-400 hover:text-rose-400 hover:bg-stone-800'
            : 'text-stone-500 hover:text-rose-600 hover:bg-rose-50/70'
        } ${isLoggingOut ? 'opacity-60 cursor-not-allowed' : ''}`}
        title="Sair da conta"
        aria-label="Sair da conta"
      >
        {isLoggingOut ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <LogOut className="w-3.5 h-3.5" />
        )}
        <span className="hidden xs:inline">Sair</span>
      </button>
    </div>
  );
};
