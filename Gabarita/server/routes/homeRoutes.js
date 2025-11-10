import express from 'express';
const router = express.Router();

// Home (pode proteger com autenticação mais tarde)
router.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à rota Home!' });
});

export default router;
