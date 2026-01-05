import axios from 'axios';

const API_URL = 'https://enem-api-neon.vercel.app/api';

const MIN_YEAR = 2009;
const MAX_YEAR = 2023;

const MAPA_AREAS = {
  'linguagens': 'linguagens',
  'ciencias-humanas': 'ciencias-humanas',
  'ciencias-natureza': 'ciencias-natureza',
  'matematica': 'matematica'
};

export const fetchRandomQuestionsFromExternalAPI = async (category, quantity, attempts = 0) => {
  // 1. Evitar Loop Infinito
  if (attempts > 5) {
    console.warn(`[!] Limite de 5 tentativas excedido para ${category}. Retornando vazio.`);
    return [];
  }

  const areaKeyword = MAPA_AREAS[category];
  
  // Sorteia um ano aleatório entre MIN e MAX
  const year = Math.floor(Math.random() * (MAX_YEAR - MIN_YEAR + 1)) + MIN_YEAR;

  console.log(`[Tentativa ${attempts + 1}] Buscando ${areaKeyword} no ano ${year}...`);

  try {
    // 2. Busca a lista de questões daquele ano
    // Adicionamos timeout para não travar o servidor se a API externa cair
    const listResponse = await axios.get(`${API_URL}/questions/${year}/list`, { timeout: 5000 });
    
    // Verifica se a API retornou um array
    if (!Array.isArray(listResponse.data)) {
        console.log(`   > Ano ${year} retornou formato inválido. Tentando outro...`);
        return await fetchRandomQuestionsFromExternalAPI(category, quantity, attempts + 1);
    }

    // 3. FILTRAGEM (Onde costuma dar erro)
    // Usamos includes() para ser mais flexível (ex: "matemática" vs "matematica")
    const filtered = listResponse.data.filter(q => {
        if (!q.discipline) return false;
        // Normaliza para comparar (remove acentos e põe minúsculo)
        const dAPI = q.discipline.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const dBusca = areaKeyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return dAPI === dBusca;
    });

    if (filtered.length === 0) {
        console.log(`   > Nenhuma questão de ${areaKeyword} em ${year}. Tentando outro ano...`);
        // OBRIGATÓRIO usar 'await' e 'return' na recursão
        return await fetchRandomQuestionsFromExternalAPI(category, quantity, attempts + 1);
    }

    console.log(`   > Sucesso! Encontradas ${filtered.length} questões. Selecionando ${quantity}...`);

    // 4. Seleciona aleatoriamente e busca os detalhes
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    const selectedIds = shuffled.slice(0, quantity);

    const questionsPromises = selectedIds.map(q => 
      axios.get(`${API_URL}/questions/${year}/${q.index}`, { timeout: 5000 })
        .then(r => r.data)  
        .catch(err => {
            console.error(`     Erro ao baixar questão ${q.index}:`, err.message);
            return null;
        }) 
    );

    const fullQuestions = await Promise.all(questionsPromises);
    // Remove as que falharam (null)
    const validQuestions = fullQuestions.filter(q => q !== null);

    return validQuestions;

  } catch (error) {
    console.error(`   > Erro ao acessar API externa (${year}):`, error.message);
    // Se deu erro na API (404, 500, timeout), tenta outro ano
    return await fetchRandomQuestionsFromExternalAPI(category, quantity, attempts + 1);
  }
};
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