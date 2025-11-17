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

// Rota DELETE /api/posts/:id - Deleta um post (apenas o autor)
router.delete('/:id', protect, async (req, res) => {
  const postId = parseInt(req.params.id);
  const userId = req.user.id; // ID do usuário logado injetado pelo middleware 'protect'

  if (isNaN(postId)) {
    return res.status(400).json({ error: 'ID do post inválido.' });
  }

  try {
    // 1. Buscar o post para verificar o autor
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }, // Buscar apenas o ID do autor
    });

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado.' });
    }

    // 2. Verificar se o usuário logado é o autor do post
    if (post.authorId !== userId) {
      // 403 Forbidden - O usuário está logado, mas não tem permissão
      return res.status(403).json({ error: 'Você não tem permissão para deletar este post.' });
    }

    // 3. Deletar o post
    await prisma.post.delete({
      where: { id: postId },
    });

    // 204 No Content - Resposta padrão para exclusão bem-sucedida
    res.status(204).send();

  } catch (error) {
    console.error('Erro ao deletar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao deletar o post.' });
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
