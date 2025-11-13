import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { StackServerApp } from "@stackframe/js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Configuração do StackServerApp (Neon Auth)
const stackServerApp = new StackServerApp({
  projectId: process.env.STACK_PROJECT_ID,
  publishableClientKey: process.env.STACK_PUBLISHABLE_CLIENT_KEY,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY,
});

// Middleware básico
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// As rotas de autenticação (signup, signin, session) são tratadas pelo cliente Stackframe (React)
// que se comunica diretamente com o serviço Neon Auth. Não são necessárias rotas manuais aqui.

// Rota principal
app.get("/", (_req, res) => res.send("Servidor backend funcionando!"));

// Exemplo de rota protegida
app.get("/api/profile", async (req, res) => {
  // A sessão agora é verificada pelo StackServerApp
  const session = await stackServerApp.getSession({ headers: req.headers });
  if (!session?.user) return res.status(401).json({ error: "Não autorizado" });
  res.json({ message: "Bem-vindo(a)!", user: session.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
