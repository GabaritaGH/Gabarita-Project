// Gabarita-Project/Gabarita/server/src/post.js

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from './auth.js'; // Importa o middleware de proteção

const router = Router();
const prisma = new PrismaClient();

// Rota POST /api/posts - Cria um novo post
router.post('/', protect, async (req, res) => {
  const { title, subject, content } = req.body; // Adicionado 'subject'
  
  // O ID do usuário é injetado no req.user pelo middleware 'protect'
  const authorId = req.user.id; 

  if (!title || !subject || !content) { // Adicionada validação para 'subject'
    return res.status(400).json({ error: 'Título, assunto e conteúdo são obrigatórios.' });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        subject, // Adicionado 'subject'
        content,
        authorId,
        published: true, // Publica por padrão
      },
      include: { // Incluir o autor no retorno para o frontend
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Erro ao criar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao criar o post.' });
  }
});

export default router;

// Rota GET /api/posts - Busca todos os posts (não precisa de proteção por enquanto)
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

// Rota GET /api/posts/:id - Busca um post individual e seus comentários
router.get('/:id', async (req, res) => {
  const postId = parseInt(req.params.id);

  if (isNaN(postId)) {
    return res.status(400).json({ error: 'ID do post inválido.' });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado.' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Erro ao buscar post individual:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar o post.' });
  }
});
