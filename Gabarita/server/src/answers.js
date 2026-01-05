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

router.post('/', async (req, res) => {
  const { userId, questionId, questionYear, selectedOption, isCorrect, testId, discipline } = req.body;

  if (!userId || !questionId) {
    return res.status(400).json({ error: "Dados incompletos." });
  }

  try {
    const idDoAutor = parseInt(userId);
    const idDaQuestao = String(questionId);

    // 1. Normaliza a disciplina para achar no mapa
    const discNormalizada = discipline 
      ? discipline.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      : "";
    
    const camposStats = MAPA_ESTATISTICAS[discNormalizada]; // Pega ex: { total: 'totalHumanas', score: 'scoreHumanas' }

    // 2. Verifica se já respondeu
    const respostaExistente = await prisma.questionAnswer.findUnique({
      where: {
        authorId_questionId: {
          authorId: idDoAutor,
          questionId: idDaQuestao,
        }
      }
    });

    if (respostaExistente) {
      // Se já existe, só atualiza a resposta (sem mexer em estatísticas)
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

    // 3. Se é nova, usa TRANSACTION (Cria Resposta + Atualiza Stats)
    const result = await prisma.$transaction(async (tx) => {
      
      // A) Cria o registro da resposta (AGORA COM O CAMPO DISCIPLINE)
      const newAnswer = await tx.questionAnswer.create({
        data: {
          authorId: idDoAutor,
          questionId: idDaQuestao,
          questionYear: parseInt(questionYear) || null,
          discipline: discipline || "Geral", // <--- Agora vai funcionar porque adicionamos no schema
          selectedOption,
          isCorrect,
          testId: testId || null
        }
      });

      // B) Monta o objeto de update das estatísticas
      // Campos gerais (baseados no seu schema UserStatistics)
      const updateData = {
        questionsDone: { increment: 1 },
        questionsRight: isCorrect ? { increment: 1 } : { increment: 0 },
        questionsWrong: isCorrect ? { increment: 0 } : { increment: 1 },
      };

      // Campos específicos da matéria (se identificada)
      if (camposStats) {
        updateData[camposStats.total] = { increment: 1 }; // ex: totalHumanas + 1
        if (isCorrect) {
          updateData[camposStats.score] = { increment: 1 }; // ex: scoreHumanas + 1
        }
      }

      // C) Atualiza ou Cria a tabela de estatísticas
      await tx.userStatistics.upsert({
        where: { userId: idDoAutor },
        update: updateData,
        create: {
          userId: idDoAutor,
          questionsDone: 1,
          questionsRight: isCorrect ? 1 : 0,
          questionsWrong: isCorrect ? 0 : 1,
          // Inicializa a matéria específica se for o primeiro create
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

// GET user history (mantido igual)
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
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