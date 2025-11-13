// Gabarita-Project/Gabarita/server/src/index.js

// 1. Importações (usando 'require' para CommonJS)
import express, { json } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

// 2. Inicialização
const app = express();
const prisma = new PrismaClient();
const PORT = 5000;

// 3. Configuração do better-auth
const auth = betterAuth({
  adapter: prismaAdapter(prisma),
  // Outras configurações (como segredo da sessão, etc.)
  secret: 'SEGREDO_MUITO_SEGURO_E_LONGO', // **ATENÇÃO: Mude isso para uma variável de ambiente!**
  session: {
    strategy: 'jwt', // Ou 'database' se preferir
    maxAge: 60 * 60 * 24 * 7, // 1 semana
  },
});

// 4. Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // Permite requisições do seu frontend Vite
  credentials: true,
} ));
app.use(json());
app.use(auth.middleware()); // Middleware de autenticação

// 5. Rotas de Autenticação (better-auth)
// O better-auth cria automaticamente as rotas /api/auth/signup, /api/auth/signin, etc.
app.use('/api/auth', auth.router());

// 6. Rotas de Exemplo (Protegida)
app.get('/api/profile', auth.protect(), (req, res) => {
  // Se chegou aqui, o usuário está autenticado
  res.json({
    message: 'Dados do perfil do usuário',
    user: req.user, // Dados do usuário injetados pelo auth.protect()
  });
});

// 7. Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
