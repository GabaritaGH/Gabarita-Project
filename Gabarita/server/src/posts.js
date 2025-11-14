// Gabarita-Project/Gabarita/server/src/post.js

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from './auth.js'; // Importa o middleware de proteção

const router = Router();
const prisma = new PrismaClient();

// Rota POST /api/posts - Cria um novo post (JÁ EXISTENTE)
router.post('/', protect, async (req, res) => {
  const { title, content } = req.body;
  
  // O ID do usuário é injetado no req.user pelo middleware 'protect'
  const authorId = req.user.id; 

  if (!title || !content) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios.' });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
        published: true, // Publica por padrão
      },
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Erro ao criar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao criar o post.' });
  }
});

// Rota GET /api/posts - Busca todos os posts (NOVA ROTA)
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar posts.' });
  }
});

export default router;
