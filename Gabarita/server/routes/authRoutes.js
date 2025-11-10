import express from 'express';
const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Aqui você colocará a lógica de autenticação futuramente
  res.json({ message: 'Login bem-sucedido (mock)' });
});

// Registro
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  // Aqui você colocará a lógica de registro futuramente
  res.json({ message: 'Usuário registrado com sucesso (mock)' });
});

export default router;
