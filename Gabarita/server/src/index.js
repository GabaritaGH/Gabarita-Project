// Gabarita-Project/Gabarita/server/src/index.js

// 1. Importações
import express, { json } from 'express';
import cors from 'cors';
import { prisma } from './prisma.js'; 
import postRouter from './posts.js'; 
import commentRouter from './comments.js';
import authRouter, { protect } from './auth.js'; // Importa o router e o middleware de proteção

// 2. Inicialização
const app = express();
const PORT = 5000;

// 3. Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // Permite requisições do seu frontend Vite
  credentials: true,
}  ));
app.use(json());

// 4. Rotas
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);

// 5. Rotas Protegidas (Exemplo)
app.get('/api/profile', protect, (req, res) => {
  // Se chegou aqui, o token JWT foi validado pelo middleware 'protect'
  res.json({
    message: 'Dados do perfil do usuário (Rota Protegida)',
    user: req.user, // Dados do usuário injetados pelo middleware
  });
});

// 6. Rotas de Exemplo (Rota de teste simples)
app.get('/api/status', (req, res) => {
  res.json({
    message: 'Servidor Gabarita+ está online e funcionando!',
    database: 'Conectado via Prisma',
  });
});

// 7. Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
