import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization da biblioteca Google GenAI
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Endpoint de saúde do servidor
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Endpoint server-side para quebrar tarefa com IA (Interactions API)
app.post('/api/tasks/breakdown', async (req, res) => {
  const { title, description, priority } = req.body || {};

  // 1. Validação estrita da entrada
  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    return res.status(400).json({
      error: 'O título da tarefa deve ter pelo menos 2 caracteres.',
    });
  }

  const cleanTitle = title.trim().slice(0, 120);
  const cleanDescription =
    typeof description === 'string' && description.trim().length > 0
      ? description.trim().slice(0, 1000)
      : undefined;

  const validPriorities = ['baixa', 'media', 'alta'];
  const basePriority = validPriorities.includes(priority) ? priority : 'media';

  // 2. Timeout e cancelamento com AbortController (60 segundos)
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, 60000);

  try {
    const ai = getAiClient();

    // 3. Chamada à Interactions API com modelo rápido e JSON Schema estruturado
    const interaction = await ai.interactions.create(
      {
        model: 'gemini-3.8-flash',
        input: `Divida esta tarefa em uma lista prática de 3 a 7 subtarefas acionáveis e diretas:
Título da Tarefa: "${cleanTitle}"
${cleanDescription ? `Detalhes / Contexto: "${cleanDescription}"` : ''}
Prioridade Atual: "${basePriority}"`,
        system_instruction:
          'Você é um assistente especialista em produtividade e divisão de tarefas em português do Brasil. ' +
          'Suas regras fundamentais: ' +
          '1. Crie entre 3 e 7 subtarefas curtas, práticas e imediatamente executáveis. ' +
          '2. Comece cada título com um verbo de ação (ex: "Definir...", "Criar...", "Revisar...", "Comprar...", "Organizar..."). ' +
          '3. O título de cada subtarefa deve ter no máximo 80 caracteres. ' +
          '4. Não invente responsáveis, pessoas ou datas/prazos fictícios. ' +
          '5. Atribua para cada etapa uma prioridade coerente ("baixa", "media" ou "alta").',
        response_format: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              description: 'Lista de 3 a 7 subtarefas executáveis',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: 'Título conciso e direto da subtarefa (máximo 80 caracteres)',
                  },
                  priority: {
                    type: Type.STRING,
                    enum: ['baixa', 'media', 'alta'],
                    description: 'Nível de prioridade da subtarefa',
                  },
                },
                required: ['title', 'priority'],
              },
            },
          },
          required: ['subtasks'],
        },
      },
      {
        signal: abortController.signal,
      }
    );

    clearTimeout(timeoutId);

    // 4. Extração do conteúdo gerado pelo modelo na Interactions API
    let rawText = '';
    const lastStep = interaction.steps?.at(-1);
    if (lastStep?.type === 'model_output' && Array.isArray(lastStep.content)) {
      for (const part of lastStep.content) {
        if (part.type === 'text' && typeof part.text === 'string') {
          rawText += part.text;
        }
      }
    }

    if (!rawText.trim()) {
      throw new Error('Nenhum texto retornado pelo modelo Gemini.');
    }

    // 5. Validação rigorosa da saída
    let parsedData: any;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Se houver algum caractere extra ou markdown envolto
      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    if (!parsedData || !Array.isArray(parsedData.subtasks) || parsedData.subtasks.length === 0) {
      return res.status(500).json({
        error: 'A IA não retornou uma lista de subtarefas válida. Tente novamente.',
      });
    }

    // Sanitizar e limitar entre 3 e 7 subtarefas válidas
    const validatedSubtasks = parsedData.subtasks
      .filter((item: any) => item && typeof item.title === 'string' && item.title.trim().length > 0)
      .slice(0, 7)
      .map((item: any) => {
        const itemTitle = item.title.trim().slice(0, 80);
        const itemPriority = validPriorities.includes(item.priority) ? item.priority : 'media';
        return {
          title: itemTitle,
          priority: itemPriority,
        };
      });

    if (validatedSubtasks.length === 0) {
      return res.status(500).json({
        error: 'Nenhuma subtarefa utilizável foi produzida. Tente novamente.',
      });
    }

    return res.json({
      originalTitle: cleanTitle,
      subtasks: validatedSubtasks,
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('Erro no processamento de quebra com IA:', error);

    // Timeout
    if (error?.name === 'AbortError' || abortController.signal.aborted) {
      return res.status(504).json({
        error: 'A resposta da IA demorou mais que o esperado. Por favor, tente novamente.',
      });
    }

    // Rate limits e Quota
    const errorMsg = String(error?.message || '');
    if (
      errorMsg.includes('429') ||
      errorMsg.includes('RESOURCE_EXHAUSTED') ||
      errorMsg.includes('quota')
    ) {
      return res.status(429).json({
        error: 'Limite de requisições à IA temporariamente atingido. Aguarde alguns instantes e tente novamente.',
      });
    }

    // Chave não configurada
    if (errorMsg.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        error: 'Chave do Gemini não configurada no ambiente do servidor.',
      });
    }

    return res.status(500).json({
      error: 'Não foi possível gerar a divisão da tarefa com IA no momento. Tente novamente.',
    });
  }
});

// Configuração do Vite middleware e arquivos estáticos
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`EasyTask Server ativo em http://0.0.0.0:${PORT}`);
  });
}

startServer();
