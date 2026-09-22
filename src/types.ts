export type Priority = 'baixa' | 'media' | 'alta';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // Formato YYYY-MM-DD
  category?: string;
  completed: boolean;
  createdAt: number;
}

export type FilterStatus = 'todas' | 'pendentes' | 'concluidas';
export type FilterPriority = 'todas' | Priority;

export interface TaskFormData {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  category?: string;
}

/**
 * Estrutura do documento armazenado na coleção `tarefas` do Cloud Firestore
 */
export interface TarefaDocument {
  userId: string;
  titulo: string;
  descricao?: string;
  prioridade: Priority;
  categoria?: string;
  dataLimite?: string;
  status: 'pendente' | 'concluida';
  criadoEm: number;
}

export interface SubtaskSuggestion {
  id: string;
  title: string;
  priority: Priority;
  selected: boolean;
}

export interface BreakdownTaskResponse {
  originalTitle: string;
  subtasks: {
    title: string;
    priority: Priority;
  }[];
}

/**
 * Converte um documento do Firestore para a tipagem interna Task da UI
 */
export function mapFirestoreDocToTask(id: string, data: Record<string, any>): Task {
  return {
    id,
    userId: data.userId || '',
    title: data.titulo || '',
    description: data.descricao || undefined,
    priority: (data.prioridade as Priority) || 'media',
    dueDate: data.dataLimite || undefined,
    category: data.categoria || undefined,
    completed: data.status === 'concluida',
    createdAt: typeof data.criadoEm === 'number'
      ? data.criadoEm
      : data.criadoEm?.toMillis?.() || Date.now(),
  };
}
