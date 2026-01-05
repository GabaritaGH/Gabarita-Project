// Gabarita-Project/Gabarita/server/src/index.js

// 1. Importações
import express, { json } from 'express';
import cors from 'cors';
import { prisma } from './prisma.js'; 
import postRouter from './posts.js'; 
import commentRouter from './comments.js';
import questionsRoutes from '../routes/questionRoutes.js';
import authRouter, { protect } from './auth.js';
import answersRouter from './answers.js'; // <--- [NOVO] Importe aqui
import testsRouter from './tests.js';

// 2. Inicialização
const app = express();
const PORT = 5000;

// 3. Middlewares
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));
app.use(json());

// 4. Rotas
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/questions', questionsRoutes);
app.use('/api/answers', answersRouter); // <--- [NOVO] Adicione a rota aqui
app.use('/api/tests', testsRouter);

// 7. Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});