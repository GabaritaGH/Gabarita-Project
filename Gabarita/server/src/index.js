import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Configuração do Better Auth
const auth = betterAuth({
  database: prismaAdapter(prisma, {}),
  secret: process.env.AUTH_SECRET || "uma-senha-super-secreta",
  emailAndPassword: { enabled: true },
});

// Middleware básico
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ✅ Integração manual com Express
app.post("/api/auth/signup", async (req, res) => {
  try {
    const result = await auth.api.signup(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/auth/signin", async (req, res) => {
  try {
    const result = await auth.api.signin(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/auth/session", async (req, res) => {
  try {
    const result = await auth.api.session(req);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: "Sessão inválida" });
  }
});

// Rota principal
app.get("/", (_req, res) => res.send("Servidor backend funcionando!"));

// Exemplo de rota protegida
app.get("/api/profile", async (req, res) => {
  const session = await auth.api.session(req);
  if (!session?.user) return res.status(401).json({ error: "Não autorizado" });
  res.json({ message: "Bem-vindo(a)!", user: session.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
