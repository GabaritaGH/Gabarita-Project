// server/src/questions.js
import axios from 'axios';

const API_URL = 'https://enem-api-neon.vercel.app/api';

const MIN_YEAR = 2009;
const MAX_YEAR = 2023;

// Mapeamento para traduzir a categoria do Front para o filtro da API Externa
// A API retorna: "matematica", "ciencias-humanas", "ciencias-natureza", "linguagens"
const MAPA_AREAS = {
  'matematica': 'matematica',
  'ciencias-humanas': 'ciencias-humanas',
  'ciencias-natureza': 'ciencias-natureza',
  'linguagens': 'linguagens',
  'ingles': 'linguagens',   // Inglês está dentro de linguagens na API
  'espanhol': 'linguagens'  // Espanhol está dentro de linguagens na API
};

// ==========================================
// 1. FUNÇÃO AUXILIAR (Usada pelo Gerador de Simulados)
// ==========================================
export const fetchRandomQuestionsFromExternalAPI = async (category, quantity, attempts = 0) => {
  // 1. Evitar Loop Infinito
  if (attempts > 5) {
    console.warn(`[!] Limite de 5 tentativas excedido para ${category}. Retornando vazio.`);
    return [];
  }

  // Pega a palavra-chave correta para a API (ex: 'ciencias-humanas')
  const areaKeyword = MAPA_AREAS[category];
  
  if (!areaKeyword) {
      console.error(`Categoria inválida: ${category}`);
      return [];
  }

  // Sorteia um ano aleatório entre MIN e MAX
  const year = Math.floor(Math.random() * (MAX_YEAR - MIN_YEAR + 1)) + MIN_YEAR;

  console.log(`[Tentativa ${attempts + 1}] Buscando ${areaKeyword} no ano ${year}...`);

  try {
    // 2. Busca a lista de questões daquele ano
    const listResponse = await axios.get(`${API_URL}/questions/${year}/list`, { timeout: 8000 });
    
    if (!Array.isArray(listResponse.data)) {
        console.log(`   > Ano ${year} retornou formato inválido. Tentando outro...`);
        return await fetchRandomQuestionsFromExternalAPI(category, quantity, attempts + 1);
    }

    // 3. FILTRAGEM
    // Normaliza strings para evitar erros de acentuação ou case
    const filtered = listResponse.data.filter(q => {
        if (!q.discipline) return false;
        
        const dAPI = q.discipline.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const dBusca = areaKeyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return dAPI === dBusca;
    });

    if (filtered.length === 0) {
        console.log(`   > Nenhuma questão de ${areaKeyword} em ${year}. Tentando outro ano...`);
        return await fetchRandomQuestionsFromExternalAPI(category, quantity, attempts + 1);
    }

    console.log(`   > Sucesso! Encontradas ${filtered.length} questões. Selecionando ${quantity}...`);

    // 4. Seleciona aleatoriamente IDs
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    const selectedIds = shuffled.slice(0, quantity);

    // 5. Busca os detalhes de cada questão selecionada
    const questionsPromises = selectedIds.map(q => 
      axios.get(`${API_URL}/questions/${year}/${q.index}`, { timeout: 8000 })
        .then(r => r.data)  
        .catch(err => {
            console.error(`    Erro ao baixar questão ${q.index}:`, err.message);
            return null;
        }) 
    );

    const fullQuestions = await Promise.all(questionsPromises);
    // Remove as que falharam (null) e garante que tenham conteúdo
    const validQuestions = fullQuestions.filter(q => q !== null && q.content);

    // Se após filtrar erros, tivermos menos questões que o necessário, tenta completar
    if (validQuestions.length < quantity && attempts < 5) {
        console.log("   > Algumas falharam, tentando buscar mais...");
        const missing = quantity - validQuestions.length;
        const moreQuestions = await fetchRandomQuestionsFromExternalAPI(category, missing, attempts + 1);
        return [...validQuestions, ...moreQuestions];
    }

    return validQuestions;

  } catch (error) {
    console.error(`   > Erro ao acessar API externa (${year}):`, error.message);
    // Se deu erro na API (404, 500, timeout), tenta outro ano
    return await fetchRandomQuestionsFromExternalAPI(category, quantity, attempts + 1);
  }
};

// ==========================================
// 2. CONTROLLERS (Usados pelas rotas do Banco de Questões)
// ==========================================

// Buscar lista de Anos (Exams)
export const getExams = async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/exams`);
    return res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar exames:", error.message);
    return res.status(500).json({ error: "Erro ao buscar exames" });
  }
};

// Buscar Lista de Questões de um Ano específico
export const getQuestionsList = async (req, res) => {
  const { year } = req.params;
  try {
    const response = await axios.get(`${API_URL}/questions/${year}/list`);
    return res.json(response.data);
  } catch (error) {
    console.error(`Erro ao buscar lista do ano ${year}:`, error.message);
    return res.status(500).json({ error: "Erro ao buscar lista de questões" });
  }
};

// Buscar Detalhes de uma Questão específica
export const getQuestionDetails = async (req, res) => {
  const { year, id } = req.params;

  console.log(`---> Backend buscando: Ano ${year}, ID/Index: ${id}`);

  try {
    // Repassa o ID exatamente como veio (pode ser "1", "14" ou "5-ingles")
    const response = await axios.get(`${API_URL}/questions/${year}/${id}`);
    return res.json(response.data);
  } catch (error) {
    if (error.response) {
        // Erro vindo da API externa (ex: 404)
        console.error("Erro na API externa:", error.response.status);
        return res.status(error.response.status).json(error.response.data);
    }
    // Erro de rede ou código
    console.error("Erro interno:", error.message);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};