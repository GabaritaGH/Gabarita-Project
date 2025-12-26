import axios from 'axios';

const API_URL = 'https://enem-api-neon.vercel.app/api';

// 1. Buscar os Anos (Exams)
export const getExams = async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/exams`);
    return res.json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar exames" });
  }
};

// 2. Buscar Lista de Questões de um Ano
export const getQuestionsList = async (req, res) => {
  const { year } = req.params;
  try {
    const response = await axios.get(`${API_URL}/questions/${year}/list`);
    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar lista de questões" });
  }
};

// 3. Buscar Detalhes de uma Questão
// src/questions.js

export const getQuestionDetails = async (req, res) => {
  const { year, id } = req.params;

  console.log(`---> Backend buscando: Ano ${year}, ID/Index: ${id}`);

  try {
    // NÃO fazemos mais parseInt forçado aqui, pois o ID pode ser "1-ingles"
    // Repassamos o ID exatamente como o frontend mandou para a API externa
    const response = await axios.get(`${API_URL}/questions/${year}/${id}`);
    
    return res.json(response.data);
  } catch (error) {
    if (error.response) {
        console.error("Erro na API externa:", error.response.status, error.response.data);
        return res.status(error.response.status).json(error.response.data);
    }
    console.error("Erro interno:", error.message);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};