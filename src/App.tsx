import { useState, useEffect, useMemo } from 'react';
import { CheckSquare, Moon, Sun, AlertCircle, Loader2 } from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  deleteField,
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { db, auth, googleProvider } from './lib/firebase';
import { Task, TaskFormData, FilterStatus, FilterPriority, Priority, mapFirestoreDocToTask } from './types';
import { TaskSummary } from './components/TaskSummary';
import { TaskForm } from './components/TaskForm';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { EditTaskModal } from './components/EditTaskModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { BreakdownModal } from './components/BreakdownModal';
import { UserAuthBar } from './components/UserAuthBar';
import { WelcomeState } from './components/WelcomeState';

const THEME_STORAGE_KEY = 'easytask_theme_dark_mode';

export default function App() {
  // Estado para Dark Mode (Padrão: true / escuro)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        return savedTheme === 'true';
      }
    } catch {
      // Fallback
    }
    return true;
  });

  // Estados de Autenticação com Firebase
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  // Estados para Lista de Tarefas (Sincronizado em tempo real com Cloud Firestore)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados para Filtros no Frontend
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('todas');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('todas');

  // Estado para Edição
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Estado para Confirmação de Exclusão
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Estados para Quebrar Tarefa com IA
  const [breakingDownTaskId, setBreakingDownTaskId] = useState<string | null>(null);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState<boolean>(false);
  const [breakdownOriginalTask, setBreakdownOriginalTask] = useState<Task | null>(null);
  const [breakdownSuggestions, setBreakdownSuggestions] = useState<{ title: string; priority: Priority }[]>([]);
  const [isSavingBreakdown, setIsSavingBreakdown] = useState<boolean>(false);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);

  // Persistência do tema claro/escuro
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, String(darkMode));
    } catch {
      // Ignorar erros de armazenamento local de tema
    }
  }, [darkMode]);

  // 1. Observar estado de autenticação com Firebase Authentication
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setIsAuthLoading(false);
      },
      (error) => {
        console.error('Erro ao observar estado de autenticação:', error);
        setAuthErrorMessage('Erro ao verificar sessão de usuário.');
        setIsAuthLoading(false);
      }
    );

    return () => unsubscribeAuth();
  }, []);

  // 2. READ: Carregar tarefas da coleção `tarefas` do Cloud Firestore filtradas pelo UID do usuário
  useEffect(() => {
    // Se o usuário não estiver autenticado, limpa tarefas e encerra
    if (!currentUser) {
      setTasks([]);
      setIsLoadingTasks(false);
      return;
    }

    setIsLoadingTasks(true);
    setErrorMessage(null);

    // Consulta filtrando no Firestore pelo userId do usuário logado
    const q = query(
      collection(db, 'tarefas'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribeSnapshot = onSnapshot(
      q,
      (snapshot) => {
        const loadedTasks: Task[] = snapshot.docs
          .map((docSnap) => mapFirestoreDocToTask(docSnap.id, docSnap.data()))
          .sort((a, b) => b.createdAt - a.createdAt);

        setTasks(loadedTasks);
        setIsLoadingTasks(false);
      },
      (error: any) => {
        console.error('Erro ao ler tarefas do Firestore:', error);
        if (error?.code === 'permission-denied') {
          setErrorMessage(
            'Permissão negada pelo Firestore. Apenas você pode visualizar suas tarefas.'
          );
        } else {
          setErrorMessage(
            'Não foi possível carregar as tarefas do Cloud Firestore. Verifique sua conexão.'
          );
        }
        setIsLoadingTasks(false);
      }
    );

    return () => unsubscribeSnapshot();
  }, [currentUser]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Login com Google via Popup
  const handleLoginWithGoogle = async () => {
    setIsLoggingIn(true);
    setAuthErrorMessage(null);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Erro no Google Sign-In:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        setAuthErrorMessage('O login foi cancelado porque a janela foi fechada.');
      } else if (error?.code === 'auth/cancelled-popup-request') {
        // Outro popup em andamento
      } else if (error?.code === 'auth/network-request-failed') {
        setAuthErrorMessage('Falha de conexão com os servidores do Google. Verifique sua rede.');
      } else {
        setAuthErrorMessage(
          error?.message || 'Não foi possível autenticar com o Google. Tente novamente.'
        );
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout com limpeza de estado
  const handleLogout = async () => {
    setIsLoggingOut(true);
    setErrorMessage(null);
    setAuthErrorMessage(null);

    try {
      await signOut(auth);
      // Limpar todos os estados da interface
      setTasks([]);
      setStatusFilter('todas');
      setPriorityFilter('todas');
      setEditingTask(null);
      setIsEditModalOpen(false);
      setDeletingTask(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Erro ao deslogar:', error);
      setErrorMessage('Erro ao deslogar. Tente novamente.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Métricas calculadas para resumo e filtros
  const counts = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    return { total, pending, completed };
  }, [tasks]);

  // Lista de tarefas filtrada no frontend
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter === 'pendentes' && task.completed) return false;
      if (statusFilter === 'concluidas' && !task.completed) return false;
      if (priorityFilter !== 'todas' && task.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, priorityFilter]);

  const hasActiveFilters = statusFilter !== 'todas' || priorityFilter !== 'todas';

  const handleResetFilters = () => {
    setStatusFilter('todas');
    setPriorityFilter('todas');
  };

  // CREATE: Cadastrar nova tarefa no Firestore com userId = currentUser.uid
  const handleAddTask = async (data: TaskFormData): Promise<boolean> => {
    if (!currentUser) {
      setErrorMessage('Você precisa estar autenticado para cadastrar tarefas.');
      return false;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const docPayload: Record<string, any> = {
        userId: currentUser.uid, // Atribui o UID do usuário autenticado
        titulo: data.title.trim(),
        prioridade: data.priority,
        status: 'pendente',
        criadoEm: Date.now(),
      };

      if (data.description?.trim()) docPayload.descricao = data.description.trim();
      if (data.category?.trim()) docPayload.categoria = data.category.trim();
      if (data.dueDate) docPayload.dataLimite = data.dueDate;

      await addDoc(collection(db, 'tarefas'), docPayload);
      setIsSubmitting(false);
      return true;
    } catch (error: any) {
      console.error('Erro ao cadastrar tarefa no Firestore:', error);
      if (error?.code === 'permission-denied') {
        setErrorMessage(
          'Permissão negada pelo Firestore. Apenas você pode cadastrar tarefas em sua conta.'
        );
      } else {
        setErrorMessage(
          'Erro ao salvar a tarefa no Firestore. Os dados digitados foram mantidos para tentar novamente.'
        );
      }
      setIsSubmitting(false);
      return false;
    }
  };

  // UPDATE: Concluir ou reabrir tarefa no Firestore
  const handleToggleTask = async (id: string) => {
    if (!currentUser) return;
    const targetTask = tasks.find((t) => t.id === id);
    if (!targetTask) return;

    const nextStatus = targetTask.completed ? 'pendente' : 'concluida';

    try {
      await updateDoc(doc(db, 'tarefas', id), {
        status: nextStatus,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status da tarefa no Firestore:', error);
      if (error?.code === 'permission-denied') {
        setErrorMessage('Permissão negada: você só pode modificar suas próprias tarefas.');
      } else {
        setErrorMessage('Não foi possível atualizar o status da tarefa no Firestore.');
      }
    }
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  // UPDATE: Editar os campos da tarefa no Firestore mantendo o userId inalterado
  const handleSaveEdit = async (id: string, data: TaskFormData): Promise<boolean> => {
    if (!currentUser) return false;
    setIsSavingEdit(true);
    setErrorMessage(null);

    try {
      const updatePayload: Record<string, any> = {
        titulo: data.title.trim(),
        prioridade: data.priority,
      };

      if (data.description?.trim()) {
        updatePayload.descricao = data.description.trim();
      } else {
        updatePayload.descricao = deleteField();
      }

      if (data.category?.trim()) {
        updatePayload.categoria = data.category.trim();
      } else {
        updatePayload.categoria = deleteField();
      }

      if (data.dueDate) {
        updatePayload.dataLimite = data.dueDate;
      } else {
        updatePayload.dataLimite = deleteField();
      }

      await updateDoc(doc(db, 'tarefas', id), updatePayload);
      setIsSavingEdit(false);
      setEditingTask(null);
      setIsEditModalOpen(false);
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar alterações da tarefa no Firestore:', error);
      if (error?.code === 'permission-denied') {
        setErrorMessage('Permissão negada: você só pode editar suas próprias tarefas.');
      } else {
        setErrorMessage('Não foi possível salvar as alterações da tarefa no Firestore.');
      }
      setIsSavingEdit(false);
      return false;
    }
  };

  const handleRequestDelete = (task: Task) => {
    setDeletingTask(task);
    setIsDeleteModalOpen(true);
  };

  // DELETE: Excluir documento confirmado pelo usuário no Firestore
  const handleConfirmDelete = async () => {
    if (!currentUser || !deletingTask) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteDoc(doc(db, 'tarefas', deletingTask.id));
      setIsDeleting(false);
      setDeletingTask(null);
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      console.error('Erro ao excluir tarefa no Firestore:', error);
      if (error?.code === 'permission-denied') {
        setErrorMessage('Permissão negada: você só pode excluir suas próprias tarefas.');
      } else {
        setErrorMessage('Erro ao excluir a tarefa no Firestore.');
      }
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeletingTask(null);
    setIsDeleteModalOpen(false);
  };

  // DELETE: Limpar todas as tarefas marcadas como concluídas do usuário
  const handleClearCompleted = async () => {
    if (!currentUser) return;
    const completedTasks = tasks.filter((t) => t.completed);
    if (completedTasks.length === 0) return;

    try {
      await Promise.all(
        completedTasks.map((task) => deleteDoc(doc(db, 'tarefas', task.id)))
      );
    } catch (error: any) {
      console.error('Erro ao limpar tarefas concluídas no Firestore:', error);
      if (error?.code === 'permission-denied') {
        setErrorMessage('Permissão negada: você só pode excluir suas próprias tarefas.');
      } else {
        setErrorMessage('Erro ao excluir algumas tarefas concluídas no Firestore.');
      }
    }
  };

  // AI: Quebrar tarefa com IA (chama endpoint server-side /api/tasks/breakdown)
  const handleBreakdownTask = async (task: Task) => {
    if (!currentUser) {
      setErrorMessage('Você precisa estar autenticado para usar a IA.');
      return;
    }

    // Prevenção de chamadas concorrentes / clique duplo
    if (breakingDownTaskId) return;

    setBreakingDownTaskId(task.id);
    setBreakdownError(null);

    try {
      // Segurança: Apenas título, descrição e prioridade são enviados (sem UID ou e-mail)
      const response = await fetch('/api/tasks/breakdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          priority: task.priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || 'Não foi possível gerar a divisão da tarefa com IA.'
        );
      }

      if (Array.isArray(data.subtasks) && data.subtasks.length > 0) {
        setBreakdownOriginalTask(task);
        setBreakdownSuggestions(data.subtasks);
        setIsBreakdownModalOpen(true);
      } else {
        throw new Error('A IA não retornou nenhuma subtarefa utilizável.');
      }
    } catch (err: any) {
      console.error('Erro ao solicitar quebra de tarefa com IA:', err);
      setBreakdownError(
        err?.message || 'Falha de comunicação com o serviço de IA. Tente novamente.'
      );
    } finally {
      setBreakingDownTaskId(null);
    }
  };

  // AI: Confirmar e salvar as subtarefas selecionadas no Cloud Firestore
  const handleConfirmBreakdown = async (
    selectedSubtasks: { title: string; priority: Priority }[]
  ) => {
    if (!currentUser || !breakdownOriginalTask) return;

    setIsSavingBreakdown(true);
    setBreakdownError(null);

    try {
      const now = Date.now();

      // Salva cada subtarefa confirmada como uma tarefa independente pertencente ao usuário
      for (let i = 0; i < selectedSubtasks.length; i++) {
        const item = selectedSubtasks[i];
        const docPayload: Record<string, any> = {
          userId: currentUser.uid,
          titulo: item.title,
          prioridade: item.priority,
          status: 'pendente',
          criadoEm: now + i, // Incremento para preservar a ordem sugerida
        };

        // Mantém a categoria da tarefa de origem se houver, para coerência
        if (breakdownOriginalTask.category?.trim()) {
          docPayload.categoria = breakdownOriginalTask.category.trim();
        }

        await addDoc(collection(db, 'tarefas'), docPayload);
      }

      // Fecha o modal e limpa o estado
      setIsBreakdownModalOpen(false);
      setBreakdownOriginalTask(null);
      setBreakdownSuggestions([]);
    } catch (err: any) {
      console.error('Erro ao persistir subtarefas no Firestore:', err);
      if (err?.code === 'permission-denied') {
        setErrorMessage('Permissão negada pelo Firestore ao cadastrar as subtarefas.');
      } else {
        setErrorMessage('Erro ao salvar as tarefas sugeridas no Firestore.');
      }
    } finally {
      setIsSavingBreakdown(false);
    }
  };

  return (
    <main
      className={`min-h-screen py-8 sm:py-12 px-4 sm:px-6 font-sans transition-colors duration-200 ${
        darkMode ? 'bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-900'
      }`}
    >
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 relative">
        {/* Barra Superior: Perfil / Login do Usuário + Botão de Tema */}
        <div id="top-nav-bar" className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs transition-colors ${
                darkMode
                  ? 'bg-stone-850 border-stone-700 text-stone-100'
                  : 'bg-stone-900 border-stone-800 text-white'
              }`}
            >
              <CheckSquare className="w-5 h-5" />
            </div>
            <span
              id="brand-name"
              className={`font-bold tracking-tight text-base sm:text-lg ${
                darkMode ? 'text-stone-100' : 'text-stone-900'
              }`}
            >
              EasyTask
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isAuthLoading && (
              <UserAuthBar
                currentUser={currentUser}
                onLoginWithGoogle={handleLoginWithGoogle}
                onLogout={handleLogout}
                isLoggingIn={isLoggingIn}
                isLoggingOut={isLoggingOut}
                darkMode={darkMode}
              />
            )}

            <button
              id="theme-toggle-btn"
              type="button"
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl border shadow-xs transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 ${
                darkMode
                  ? 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-white'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900'
              }`}
              title={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              aria-label={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700" />
              )}
            </button>
          </div>
        </div>

        {/* Banner de Erro de Autenticação */}
        {authErrorMessage && (
          <div
            id="auth-error-banner"
            role="alert"
            className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-sm transition-all ${
              darkMode
                ? 'bg-rose-950/70 border-rose-800 text-rose-200'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-semibold">Erro de Autenticação</p>
                <p className="text-xs opacity-90 mt-0.5">{authErrorMessage}</p>
              </div>
            </div>
            <button
              id="dismiss-auth-error-btn"
              type="button"
              onClick={() => setAuthErrorMessage(null)}
              className="text-xs px-2 py-1 rounded-md border font-medium hover:bg-white/10 cursor-pointer shrink-0 transition-colors"
            >
              Dispensar
            </button>
          </div>
        )}

        {/* Banner de Erro do Firestore */}
        {errorMessage && (
          <div
            id="firestore-error-banner"
            role="alert"
            className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-sm transition-all ${
              darkMode
                ? 'bg-rose-950/70 border-rose-800 text-rose-200'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-semibold">Aviso do Sistema</p>
                <p className="text-xs opacity-90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              id="dismiss-error-btn"
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs px-2 py-1 rounded-md border font-medium hover:bg-white/10 cursor-pointer shrink-0 transition-colors"
            >
              Dispensar
            </button>
          </div>
        )}

        {/* Banner de Erro da IA (com opção de tentar novamente / dispensar) */}
        {breakdownError && (
          <div
            id="breakdown-error-banner"
            role="alert"
            className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-sm transition-all ${
              darkMode
                ? 'bg-amber-950/60 border-amber-800 text-amber-200'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p className="font-semibold">Divisão com IA</p>
                <p className="text-xs opacity-90 mt-0.5">{breakdownError}</p>
              </div>
            </div>
            <button
              id="dismiss-breakdown-error-btn"
              type="button"
              onClick={() => setBreakdownError(null)}
              className="text-xs px-2 py-1 rounded-md border font-medium hover:bg-white/10 cursor-pointer shrink-0 transition-colors"
            >
              Dispensar
            </button>
          </div>
        )}

        {/* 1. ESTADO DE CARREGAMENTO DA SESSÃO: Evita piscar telas ou vazar dados */}
        {isAuthLoading ? (
          <div
            id="auth-loading-screen"
            className={`rounded-2xl border p-12 text-center transition-colors shadow-xs ${
              darkMode
                ? 'bg-stone-900/50 border-stone-800 text-stone-400'
                : 'bg-white border-stone-200 text-stone-500'
            }`}
          >
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-stone-400 mb-3" />
            <h3 className={`font-semibold text-sm ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
              Verificando sessão segura...
            </h3>
            <p className={`text-xs mt-1 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              Conectando com o Firebase Authentication
            </p>
          </div>
        ) : !currentUser ? (
          /* 2. VISITANTE NÃO AUTENTICADO: Vê exclusivamente a área de boas-vindas / login */
          <WelcomeState
            onLoginWithGoogle={handleLoginWithGoogle}
            isLoggingIn={isLoggingIn}
            darkMode={darkMode}
          />
        ) : (
          /* 3. USUÁRIO AUTENTICADO: Vê a aplicação completa e privada */
          <>
            {/* Cabeçalho de Boas-Vindas Pessoal */}
            <header id="app-header" className="text-center space-y-1.5">
              <h1
                id="app-title"
                className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                  darkMode ? 'text-stone-100' : 'text-stone-900'
                }`}
              >
                Olá, {currentUser.displayName?.split(' ')[0] || 'você'}!
              </h1>
              <p
                id="app-subtitle"
                className={`text-sm max-w-md mx-auto ${
                  darkMode ? 'text-stone-400' : 'text-stone-600'
                }`}
              >
                Gerenciamento seguro de tarefas pessoais sincronizadas no Cloud Firestore.
              </p>
            </header>

            {/* Resumo com total, pendentes e concluídas */}
            <section id="summary-section" aria-label="Resumo das tarefas">
              <TaskSummary
                total={counts.total}
                pending={counts.pending}
                completed={counts.completed}
                currentFilter={statusFilter}
                onSelectFilter={setStatusFilter}
                darkMode={darkMode}
              />
            </section>

            {/* Formulário de nova tarefa */}
            <section id="form-section" aria-label="Cadastrar nova tarefa">
              <TaskForm
                onAddTask={handleAddTask}
                isSubmitting={isSubmitting}
                darkMode={darkMode}
              />
            </section>

            {/* Filtros no Frontend */}
            <section id="filters-section" aria-label="Filtrar tarefas">
              <TaskFilters
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                priorityFilter={priorityFilter}
                onPriorityChange={setPriorityFilter}
                counts={counts}
                hasActiveFilters={hasActiveFilters}
                onResetFilters={handleResetFilters}
                darkMode={darkMode}
              />
            </section>

            {/* Lista de tarefas, Estado de Carregamento e Estado Vazio */}
            <section id="list-section" aria-label="Lista de tarefas">
              <TaskList
                tasks={filteredTasks}
                totalTasksCount={tasks.length}
                hasActiveFilters={hasActiveFilters}
                onResetFilters={handleResetFilters}
                onToggleTask={handleToggleTask}
                onEditTask={handleOpenEdit}
                onRequestDelete={handleRequestDelete}
                onBreakdownTask={handleBreakdownTask}
                breakingDownTaskId={breakingDownTaskId}
                onClearCompleted={handleClearCompleted}
                completedTasksCount={counts.completed}
                isLoading={isLoadingTasks}
                darkMode={darkMode}
              />
            </section>
          </>
        )}
      </div>

      {/* Modal de Edição */}
      <EditTaskModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onSave={handleSaveEdit}
        isSaving={isSavingEdit}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        darkMode={darkMode}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        taskTitle={deletingTask ? deletingTask.title : ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
        darkMode={darkMode}
      />

      {/* Modal de Quebra de Tarefa com IA */}
      <BreakdownModal
        isOpen={isBreakdownModalOpen}
        originalTask={breakdownOriginalTask}
        initialSuggestions={breakdownSuggestions}
        onConfirm={handleConfirmBreakdown}
        onClose={() => {
          setIsBreakdownModalOpen(false);
          setBreakdownOriginalTask(null);
          setBreakdownSuggestions([]);
        }}
        isSaving={isSavingBreakdown}
        darkMode={darkMode}
      />
    </main>
  );
}
