// server/src/tests.js
import { Router } from 'express';
import { prisma } from './prisma.js';
// IMPORTAMOS A FUNÇÃO DO OUTRO ARQUIVO
import { fetchRandomQuestionsFromExternalAPI } from './questions.js'; 

const router = Router();

router.post('/generate', async (req, res) => {
  const { userId, category, totalQuestions } = req.body;
  const qtd = parseInt(totalQuestions) || 10;

  if (!userId || !category) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  try {
    console.log("1. Iniciando geração do simulado...");

    // PASSO A: Buscar as questões
    const questions = await fetchRandomQuestionsFromExternalAPI(category, qtd);

    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: "Não foi possível encontrar questões para essa área." });
    }

    console.log(`2. Questões encontradas: ${questions.length}`);

    // --- DEBUG: ISSO VAI MOSTRAR NO TERMINAL COMO A QUESTÃO ESTÁ ---
    console.log("🔍 INSPEÇÃO DE DADOS (Questão 0):");
    console.log(JSON.stringify(questions[0], null, 2)); 
    // -------------------------------------------------------------

    // PASSO B: Salvar registro no banco
    const newTest = await prisma.test.create({
      data: {
        authorId: parseInt(userId),
        area: category,
        title: `Simulado de ${category}`,
        totalQuestions: questions.length,
        status: "IN_PROGRESS"
      }
    });

    console.log("3. Teste salvo no banco ID:", newTest.id);

    // === CORREÇÃO AQUI ===
    // "Desembrulha" o objeto content para facilitar a vida do Frontend
    const formattedQuestions = questions.map(q => {
      // Se por acaso a questão não tiver content (erro na API), retorna ela mesma
      if (!q.content) return q;

      return {
        id: q.id,         // Mantém o ID original da raiz
        ...q.content      // Joga title, alternatives, files, etc. para o nível principal
      };
    });

    // PASSO C: Retorna o ID do banco + As questões formatadas
    res.json({
      testId: newTest.id,
      questions: formattedQuestions
    });
  } catch (error) {
    console.error("Erro no processo de gerar simulado:", error);
    res.status(500).json({ error: "Erro interno ao gerar simulado" });
  }
});

const areaMap = {
  'matematica': 'Matematica',
  'ciencias-humanas': 'Humanas',
  'ciencias-natureza': 'Natureza',
  'linguagens': 'Linguagens'
};

router.post('/finish', async (req, res) => {
  const { testId, userId, answers, timeSpent } = req.body; 
  // answers é um array de objetos: { questionId, selectedOption, isCorrect, ... }

  if (!testId || !userId || !answers) {
    return res.status(400).json({ error: "Dados incompletos." });
  }

  try {
    // 1. Calcular totais
    const totalQuestions = answers.length;
    const totalCorrect = answers.filter(a => a.isCorrect).length;
    const totalWrong = totalQuestions - totalCorrect;

    // 2. Buscar informações do Teste para saber a Área
    const currentTest = await prisma.test.findUnique({
      where: { id: parseInt(testId) },
      select: { area: true }
    });

    if (!currentTest) return res.status(404).json({ error: "Simulado não encontrado" });

    // Descobrir qual campo de estatística atualizar (Ex: scoreMatematica)
    const areaSuffix = areaMap[currentTest.area] || 'Outros'; 
    const scoreField = `score${areaSuffix}`; // ex: scoreMatematica
    const totalField = `total${areaSuffix}`; // ex: totalMatematica

    // 3. TRANSACTION: Executa tudo ou nada
    await prisma.$transaction(async (tx) => {
      
      // A) Atualizar Status do Simulado
      await tx.test.update({
        where: { id: parseInt(testId) },
        data: {
          status: "COMPLETED",
          score: totalCorrect,
          // Se tiver campo de tempo gasto no banco, pode salvar aqui também
        }
      });

      // B) Salvar cada resposta individualmente (createMany é mais rápido)
      // Precisamos formatar o array para bater com o schema do Prisma
      if (answers.length > 0) {
        await tx.questionAnswer.createMany({
          data: answers.map(a => ({
            authorId: parseInt(userId),
            testId: parseInt(testId),
            questionId: String(a.questionId), // Garante que é string
            questionYear: a.questionYear ? parseInt(a.questionYear) : null,
            selectedOption: a.selectedOption,
            isCorrect: a.isCorrect
          })),
          skipDuplicates: true // Evita erro se o front mandar duplicado sem querer
        });
      }

      // C) Atualizar Estatísticas do Usuário (UPSERT)
      // Prepara o objeto de incremento dinâmico
      const updateData = {
        totalSimulados: { increment: 1 },
        questionsDone: { increment: totalQuestions },
        questionsRight: { increment: totalCorrect },
        questionsWrong: { increment: totalWrong },
      };

      // Adiciona o incremento específico da área se existir no mapa
      if (areaSuffix !== 'Outros') {
        updateData[scoreField] = { increment: totalCorrect };
        updateData[totalField] = { increment: totalQuestions };
      }

      await tx.userStatistics.upsert({
        where: { userId: parseInt(userId) },
        create: {
          userId: parseInt(userId),
          totalSimulados: 1,
          questionsDone: totalQuestions,
          questionsRight: totalCorrect,
          questionsWrong: totalWrong,
          // Define valores iniciais para a área específica
          [scoreField]: totalCorrect,
          [totalField]: totalQuestions
        },
        update: updateData
      });

    });

    console.log(`Simulado ${testId} finalizado com sucesso para User ${userId}`);
    res.json({ success: true, score: totalCorrect, total: totalQuestions });

  } catch (error) {
    console.error("Erro ao finalizar simulado:", error);
    res.status(500).json({ error: "Erro ao salvar resultados." });
  }
});


export default router;