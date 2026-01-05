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

export default router;