// Gabarita-Project/Gabarita/server/src/answers.js
import { Router } from 'express';
import { prisma } from './prisma.js'; 

const router = Router();

// --- ROTA 1: SALVAR (POST) ---
router.post('/', async (req, res) => {
  // Agora aceitamos testId (pode vir null) e userId é obrigatório
  const { userId, questionId, questionYear, selectedOption, isCorrect, testId } = req.body;

  if (!userId || !questionId) {
    return res.status(400).json({ error: "Dados incompletos: userId e questionId são obrigatórios." });
  }

  try {
    // Convertendo IDs para o formato correto do banco
    const idDoAutor = parseInt(userId);
    const idDaQuestao = String(questionId);
    // Se vier testId, usa ele. Se não, usa null (null é aceito no banco agora)

    const answer = await prisma.questionAnswer.upsert({
      where: {
        authorId_questionId: {
          authorId: idDoAutor,
          questionId: idDaQuestao,
        }
      },
      update: { 
        selectedOption, 
        isCorrect,
        updatedAt: new Date()
      },
      create: {
        authorId: idDoAutor, 
        questionId: idDaQuestao,
        questionYear: parseInt(questionYear) || null,
        selectedOption,
        isCorrect
      }
    });

    res.json(answer);

  } catch (error) {
    console.error("Erro ao salvar resposta:", error);
    res.status(500).json({ error: "Erro interno ao salvar resposta." });
  }
});

// --- ROTA 2: CARREGAR HISTÓRICO (GET) ---
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId || isNaN(parseInt(userId))) {
      return res.json([]); 
  }

  try {
    // BUSCA DIRETA: Muito mais simples e rápido.
    // Pegamos todas as respostas onde o authorId é o usuário.
    // Isso traz tanto as respostas de simulados quanto as "soltas".
    const history = await prisma.questionAnswer.findMany({
        where: {
            authorId: parseInt(userId)
        },
        orderBy: {
            updatedAt: 'desc' // Mostra as mais recentes primeiro
        }
    });

    res.json(history);

  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

export default router;