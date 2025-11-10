import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importa as rotas
import authRoutes from './routes/authRoutes.js';
import homeRoutes from './routes/homeRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando!');
});

// Usa as rotas
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);

// Porta do servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
