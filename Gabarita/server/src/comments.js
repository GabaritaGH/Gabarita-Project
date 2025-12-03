import { Router } from 'express';
import { prisma } from './prisma.js'; 
import { protect } from './auth.js';

const router = Router();


router.post('/', protect, async (req, res) => {
  const { content, postId } = req.body;
  const authorId = req.user.id; 

  if (!content || !postId) {
    return res.status(400).json({ message: 'Conteúdo e ID do post são obrigatórios.' });
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        content,
        postId: parseInt(postId),
        authorId,
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
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar comentário.' });
  }
});

export default router;