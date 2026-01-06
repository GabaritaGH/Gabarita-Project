// server/src/answers.js
import { Router } from 'express';
import { prisma } from './prisma.js';

const router = Router();

// Mapeamento: Disciplina do Front -> Campos do seu UserStatistics
const MAPA_ESTATISTICAS = {
  'matematica':       { total: 'totalMatematica', score: 'scoreMatematica' },
  'ciencias-humanas': { total: 'totalHumanas',    score: 'scoreHumanas' },
  'ciencias-natureza':{ total: 'totalNatureza',   score: 'scoreNatureza' },
  'linguagens':       { total: 'totalLinguagens', score: 'scoreLinguagens' },
  'ingles':           { total: 'totalLinguagens', score: 'scoreLinguagens' },
  'espanhol':         { total: 'totalLinguagens', score: 'scoreLinguagens' }
};

// --- ROTA 1: Salvar Resposta (POST /api/answers) ---
router.post('/', async (req, res) => {
  const { userId, questionId, questionYear, selectedOption, isCorrect, testId, discipline } = req.body;

  if (!userId || !questionId) {
    return res.status(400).json({ error: "Dados incompletos." });
  }

  try {
    const idDoAutor = parseInt(userId);
    const idDaQuestao = String(questionId);

    // CORREÇÃO DA NORMALIZAÇÃO:
    // 1. Lowercase -> 2. Remove Acentos -> 3. Troca espaço por hífen
    const discNormalizada = discipline 
      ? discipline.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
          .replace(/\s+/g, '-') 
      : "";
    
    const camposStats = MAPA_ESTATISTICAS[discNormalizada]; 

    // Verifica se já respondeu
    const respostaExistente = await prisma.questionAnswer.findUnique({
      where: {
        authorId_questionId: {
          authorId: idDoAutor,
          questionId: idDaQuestao,
        }
      }
    });

    if (respostaExistente) {
      const updated = await prisma.questionAnswer.update({
        where: { id: respostaExistente.id },
        data: {
          selectedOption,
          isCorrect,
          updatedAt: new Date()
        }
      });
      return res.json(updated);
    }

    // Transação para criar resposta e atualizar estatísticas
    const result = await prisma.$transaction(async (tx) => {
      
      const newAnswer = await tx.questionAnswer.create({
        data: {
          authorId: idDoAutor,
          questionId: idDaQuestao,
          questionYear: parseInt(questionYear) || null,
          discipline: discipline || "Geral", 
          selectedOption,
          isCorrect,
          testId: testId || null
        }
      });

      const updateData = {
        questionsDone: { increment: 1 },
        questionsRight: isCorrect ? { increment: 1 } : { increment: 0 },
        questionsWrong: isCorrect ? { increment: 0 } : { increment: 1 },
      };

      if (camposStats) {
        updateData[camposStats.total] = { increment: 1 };
        if (isCorrect) {
          updateData[camposStats.score] = { increment: 1 };
        }
      }

      await tx.userStatistics.upsert({
        where: { userId: idDoAutor },
        update: updateData,
        create: {
          userId: idDoAutor,
          questionsDone: 1,
          questionsRight: isCorrect ? 1 : 0,
          questionsWrong: isCorrect ? 0 : 1,
          ...(camposStats ? {
             [camposStats.total]: 1,
             [camposStats.score]: isCorrect ? 1 : 0 
          } : {})
        }
      });

      return newAnswer;
    });

    res.json(result);

  } catch (error) {
    console.error("Erro ao salvar resposta:", error);
    res.status(500).json({ error: "Erro interno ao salvar resposta." });
  }
});

// --- ROTA 2: Pegar Estatísticas (GET /api/answers/statistics/:userId) ---
// Coloque esta rota ANTES da rota `/:userId` para evitar conflito de URL
router.get('/statistics/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const stats = await prisma.userStatistics.findUnique({
            where: {
                userId: parseInt(userId)
            }
        });

        if (!stats) {
            return res.json({
                questionsDone: 0,
                questionsRight: 0,
                totalMatematica: 0,
                totalHumanas: 0,
                totalNatureza: 0,
                totalLinguagens: 0
            });
        }

        res.json(stats);
    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        res.status(500).json({ error: "Erro interno" });
    }
});

// --- ROTA 3: Histórico Geral (GET /api/answers/:userId) ---
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  // Verifica se userId é número para não confundir com outras rotas
  if (!userId || isNaN(parseInt(userId))) return res.json([]); 

  try {
    const history = await prisma.questionAnswer.findMany({
        where: { authorId: parseInt(userId) },
        orderBy: { updatedAt: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

export default router;