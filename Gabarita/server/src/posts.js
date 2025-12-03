import { Router } from 'express';
import { prisma } from './prisma.js'; 
import { protect } from './auth.js'; 

const router = Router();

router.post('/', protect, async (req, res) => {
  const { title, subject, content } = req.body; 
  
  const authorId = req.user.id; 

  if (!title || !subject || !content) { 
    return res.status(400).json({ error: 'Título, assunto e conteúdo são obrigatórios.' });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        subject, 
        content,
        authorId,
        published: true, 
      },
      include: { 
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


router.delete('/:id', protect, async (req, res) => {
  const postId = parseInt(req.params.id);
  const userId = req.user.id; 

  if (isNaN(postId)) {
    return res.status(400).json({ error: 'ID do post inválido.' });
  }

  try {

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }, 
    });

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado.' });
    }


    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para deletar este post.' });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.status(204).send();

  } catch (error) {
    console.error('Erro ao deletar post:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao deletar o post.' });
  }
});

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
