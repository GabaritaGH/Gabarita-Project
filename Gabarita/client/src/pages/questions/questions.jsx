// client/src/pages/questions/Questions.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineArrowLeft, AiOutlineScissor } from 'react-icons/ai';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import './questions.css';
import { useNavigate } from 'react-router-dom';
import { getUserId, isAuthenticated } from '../../utils/auth';

const Questions = () => {
    // URL do SEU servidor (Backend)
    const API_BASE = 'http://localhost:5000/api/questions';
    const API_ANSWERS = 'http://localhost:5000/api/answers';

    const navigate = useNavigate();
    const [userHistory, setUserHistory] = useState({});

    // --- ESTADOS GERAIS ---
    const [showQuestions, setShowQuestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingQuestion, setLoadingQuestion] = useState(false);

    // --- ESTADO DA LÍNGUA (NOVO) ---
    const [language, setLanguage] = useState('ingles'); // Padrão: ingles

    // --- DADOS VINDOS DA API ---
    const [exams, setExams] = useState([]); // Lista de anos (2023, 2022...)
    const [disciplines, setDisciplines] = useState([]); // Disciplinas do ano selecionado

    // --- CONTROLE DE FILTROS ---
    const [filters, setFilters] = useState({
        year: '',
        discipline: '',
    });

    // --- CONTROLE DA QUESTÃO ATUAL ---
    const [questionList, setQuestionList] = useState([]); // Lista de IDs
    const [currentIndex, setCurrentIndex] = useState(0);  // Índice atual
    const [currentQuestionData, setCurrentQuestionData] = useState(null); // Dados completos da questão

    // --- CONTROLE DE RESPOSTAS (Visual) ---
    const [selectedOption, setSelectedOption] = useState(null);
    const [eliminatedOptions, setEliminatedOptions] = useState([]);
    const [isAnswered, setIsAnswered] = useState(false);

    // 1. CARREGAR OS ANOS AO ABRIR A TELA
    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await fetch(`${API_BASE}/exams`);
                if (!response.ok) throw new Error('Erro ao buscar exames');
                const data = await response.json();
                setExams(data);
                
            } catch (error) {
                console.error("Erro:", error);
            }
        };
        fetchExams();
    }, []);

    useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${API_ANSWERS}/${userId}`);
            if (!response.ok) throw new Error('Erro ao buscar histórico');

            const data = await response.json();

            // Transformar em mapa por questionId
            const historyMap = {};
            data.forEach(item => {
                historyMap[item.questionId] = item;
            });

            setUserHistory(historyMap);
        } catch (error) {
            console.error("Erro ao carregar histórico:", error);
        }
    };

    fetchHistory();
}, []);


    // Função auxiliar para saber se a questão precisa de sufixo de língua
    const isLanguageQuestion = (year, index) => {
        const y = parseInt(year);
        const i = parseInt(index);

        // Regra 2017 em diante: Questões 1 a 5
        if (y >= 2017 && i >= 1 && i <= 5) return true;

        // Regra 2010 a 2016: Questões 91 a 95
        if (y >= 2010 && y <= 2016 && i >= 91 && i <= 95) return true;

        return false;
    };

    // 2. ATUALIZAR FILTROS (Quando escolhe o ano, carrega as disciplinas)
    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters(prev => ({ ...prev, [name]: value }));

        // Se mudou o ano, atualiza a lista de disciplinas disponíveis naquele ano
        if (name === 'year') {
            const selectedExam = exams.find(exam => exam.year.toString() === value);
            if (selectedExam) {
                setDisciplines(selectedExam.disciplines);
            }
            // Reseta a disciplina selecionada para evitar inconsistência
            setFilters(prev => ({ ...prev, year: value, discipline: '' }));
        }
    };

    // 3. BUSCAR A LISTA DE QUESTÕES (Botão Filtrar)
    const handleFilterSubmit = async () => {
        if (!filters.year) {
            alert("Por favor, selecione um Ano.");
            return;
        }

        setLoading(true);
        setShowQuestions(false);

        try {
            const response = await fetch(`${API_BASE}/${filters.year}/list`);
            const data = await response.json();

            // --- INÍCIO DA CORREÇÃO ---

            let filteredList = data;

            // 1. Filtrar por disciplina (se houver)
            if (filters.discipline) {
                filteredList = filteredList.filter(q => q.discipline === filters.discipline);
            }

            // 2. Filtrar por Língua (IMPORTANTE)
            // Isso remove as questões de espanhol se vc escolheu inglês, e vice-versa.
            filteredList = filteredList.filter(q => {
                // Se a questão tem uma propriedade 'language' (ingles ou espanhol)
                if (q.language) {
                    return q.language === language;
                }
                // Se não tem língua (matemática, natureza, etc), mantém na lista
                return true;
            });

            // --- FIM DA CORREÇÃO ---

            if (filteredList.length === 0) {
                alert("Nenhuma questão encontrada para esses filtros.");
                setLoading(false);
                return;
            }

            setQuestionList(filteredList);
            setCurrentIndex(0);

            // Carrega a primeira questão da lista FILTRADA
            // Note que passamos filteredList[0].index, mas precisamos cuidar
            // pois agora a lista está limpa.
            await fetchQuestionDetails(filters.year, filteredList[0].index);

            setShowQuestions(true);

        } catch (error) {
            console.error("Erro ao filtrar:", error);
            alert("Erro ao buscar questões. Verifique se o servidor está rodando.");
        } finally {
            setLoading(false);
        }
    };

    // 4. BUSCAR DETALHES DE UMA QUESTÃO ESPECÍFICA
    const fetchQuestionDetails = async (year, index) => {
        setLoadingQuestion(true);
        setSelectedOption(null);
        setEliminatedOptions([]);
        setIsAnswered(false);

        try {
            if (index === undefined || index === null) return;

            let questionId = index;

            // SE for uma questão de língua, adiciona o sufixo escolhido
            // AQUI usamos o estado 'language'
            if (isLanguageQuestion(year, index)) {
                questionId = `${index}-${language}`; // Ex: "1-ingles" ou "91-espanhol"
            }

            console.log(`Buscando questão ID: ${questionId}`);

            const response = await fetch(`${API_BASE}/${year}/${questionId}`);

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const data = await response.json();
            setCurrentQuestionData(data);
        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
            alert("Não foi possível carregar a questão (verifique se a língua está correta).");
        } finally {
            setLoadingQuestion(false);
        }
    };

    useEffect(() => {
    if (!currentQuestionData) return;

    let qId = currentQuestionData.content.index;

    if (isLanguageQuestion(filters.year, qId)) {
        qId = `${qId}-${language}`;
    }

    const historyItem = userHistory[qId];

    if (historyItem) {
        setSelectedOption(historyItem.selectedOption);
        setIsAnswered(true);
    }
}, [currentQuestionData, userHistory, language]);


    // --- NAVEGAÇÃO (Anterior / Próxima) ---
    const handleNextQuestion = () => {
        if (currentIndex < questionList.length - 1) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            fetchQuestionDetails(filters.year, questionList[newIndex].index);
        }
    };

    const handlePrevQuestion = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            fetchQuestionDetails(filters.year, questionList[newIndex].index);
        }
    };

    // --- LÓGICA DE INTERAÇÃO (Opções, Tesoura, Responder) ---
    const handleOptionSelect = (optionLetter) => {
        if (isAnswered || eliminatedOptions.includes(optionLetter)) return;

        // Toggle: se clicar na mesma, desmarca
        if (selectedOption === optionLetter) {
            setSelectedOption(null);
        } else {
            setSelectedOption(optionLetter);
        }
    };

    const handleEliminate = (e, optionLetter) => {
        e.stopPropagation();
        if (isAnswered) return;

        setEliminatedOptions(prev => {
            if (prev.includes(optionLetter)) return prev.filter(l => l !== optionLetter);
            if (selectedOption === optionLetter) setSelectedOption(null);
            return [...prev, optionLetter];
        });
    };

    const handleAnswerSubmit = async () => {
        // 1. Validações básicas
        if (!selectedOption) return;
        
        // Tenta pegar o ID do usuário do LocalStorage (ajuste a chave 'userId' conforme seu sistema de login)
        const storedUserId = localStorage.getItem('userId'); 
        
        if (!storedUserId) {
            alert("Você precisa estar logado para salvar seu progresso!");
            // Se quiser, pode deixar responder visualmente mesmo sem logar, 
            // mas o ideal é avisar ou redirecionar.
        }

        // 2. Trava a tela e revela as cores (Feedback Visual Imediato)
        setIsAnswered(true); 

        // 3. Prepara os dados para o Backend
        const isCorrect = selectedOption === currentQuestionData.content.correctAlternative;
        
        // Recalcula o ID da questão (para garantir que questões de inglês/espanhol tenham o sufixo correto)
        let finalQuestionId = currentQuestionData.content.index;
        if (isLanguageQuestion(filters.year, finalQuestionId)) {
            finalQuestionId = `${finalQuestionId}-${language}`;
        }

        const payload = {
            userId: storedUserId,
            questionId: finalQuestionId, // Ex: "14" ou "2-ingles"
            questionYear: filters.year,
            selectedOption: selectedOption,
            isCorrect: isCorrect,
        };

        // 4. Envia para o servidor
        if (storedUserId) {
    try {
        const response = await fetch(API_ANSWERS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("Erro ao salvar resposta no banco");
        } else {
            // ✅ ATUALIZA O HISTÓRICO LOCAL
            setUserHistory(prev => ({
                ...prev,
                [finalQuestionId]: {
                    selectedOption,
                    isCorrect
                }
            }));
        }
    } catch (error) {
        console.error("Erro de conexão:", error);
    }
}

    };

    // Função para mudar a língua e recarregar se necessário
    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        // Se já estivermos vendo uma questão, recarregar para aplicar a língua nova
        if (showQuestions && currentQuestionData) {
            // Pequeno delay para garantir que o estado atualizou antes de buscar
            setTimeout(() => {
                fetchQuestionDetails(filters.year, currentQuestionData.content.index);
            }, 100);
        }
    };

    return (
        <div className="questions-container">

            <header className="questions-header">
                <div className="header-left">
                    <Link to="/home" className="back-link">
                        <AiOutlineArrowLeft size={20} />
                    </Link>
                </div>
                <h1 className="page-title">Questões</h1>
            </header>

            <div className="questions-content">

                {/* ÁREA PRINCIPAL */}
                <div className="questions-main-area">

                    {loading ? (
                        <div className="empty-state-box">
                            <p>Buscando questões...</p>
                        </div>
                    ) : !showQuestions ? (
                        <div className="empty-state-box">
                            <h2 className="empty-state-text">Filtre para começar a resolver</h2>
                        </div>
                    ) : (
                        // CARD DA QUESTÃO
                        <div className={`question-card ${loadingQuestion ? 'loading-opacity' : ''}`}>

                            {currentQuestionData && (
                                <>
                                    {/* Navegação Topo */}
                                    <div className="question-nav">
                                        <button className="nav-btn prev" onClick={handlePrevQuestion} disabled={currentIndex === 0}>
                                            <BsArrowLeft /> Anterior
                                        </button>

                                        {/* --- ALTERAÇÃO AQUI --- */}
                                        <span className="question-counter">
                                            {/* Mostra a posição na fila (ex: 178 de 178) */}
                                            Questão {currentIndex + 1} de {questionList.length}
                                        </span>
                                        {/* ---------------------- */}

                                        <button className="nav-btn next" onClick={handleNextQuestion} disabled={currentIndex === questionList.length - 1}>
                                            Próxima <BsArrowRight />
                                        </button>
                                    </div>

                                    {/* Conteúdo: Título, Texto e Imagens */}
                                    <div className="question-body">
                                        <h3 className="question-author">{currentQuestionData.content.title}</h3>

                                        {/* Texto com quebra de parágrafos e LIMPEZA de imagens Markdown */}
                                        <div className="question-text">
                                            {/* ADICIONAMOS ( ... || "") PARA EVITAR O ERRO DE NULL */}
                                            {(currentQuestionData.content.context || "")
                                                // 1. Remove o código da imagem do texto (![...](...))
                                                .replace(/!\[.*?\]\(.*?\)/g, '')
                                                // 2. Divide em parágrafos
                                                .split('\n')
                                                .map((paragraph, index) => (
                                                    paragraph && <p key={index}>{paragraph}</p>
                                                ))
                                            }
                                        </div>

                                        {/* Imagens (se houver) */}
                                        {currentQuestionData.content.files && currentQuestionData.content.files.length > 0 && (
                                            <div className="question-images">
                                                {currentQuestionData.content.files.map((url, idx) => (
                                                    <img key={idx} src={url} alt={`Figura ${idx}`} className="q-image" />
                                                ))}
                                            </div>
                                        )}

                                        {/* Comando da questão */}
                                        {currentQuestionData.content.alternativesIntroduction && (
                                            <p className="question-intro">
                                                <strong>{currentQuestionData.content.alternativesIntroduction}</strong>
                                            </p>
                                        )}
                                    </div>

                                    {/* Alternativas */}
                                    <div className="question-options">
                                        {currentQuestionData.content.alternatives.map((option) => {
                                            const optionLetter = option.letter; // Ex: 'A', 'B'
                                            const isEliminated = eliminatedOptions.includes(optionLetter);
                                            const isSelected = selectedOption === optionLetter;
                                            const isCorrect = currentQuestionData.content.correctAlternative === optionLetter;

                                            // Lógica de cores
                                            let rowClass = "option-row";
                                            if (isAnswered) {
                                                if (isCorrect) rowClass += " correct";
                                                else if (isSelected && !isCorrect) rowClass += " wrong";
                                            }

                                            return (
                                                <div key={optionLetter} className={rowClass}>
                                                    <div
                                                        className={`option-input-wrapper ${isEliminated ? 'eliminated' : ''}`}
                                                        onClick={() => handleOptionSelect(optionLetter)}
                                                    >
                                                        <span className="option-letter">{optionLetter})</span>
                                                        <input
                                                            type="checkbox"
                                                            className="option-checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleOptionSelect(optionLetter)}
                                                            disabled={isEliminated || isAnswered}
                                                        />
                                                        {/* Texto da alternativa */}
                                                        <label className="option-label">{option.text}</label>
                                                    </div>

                                                    <button
                                                        className={`scissor-btn ${isEliminated ? 'active' : ''}`}
                                                        onClick={(e) => handleEliminate(e, optionLetter)}
                                                        disabled={isAnswered}
                                                    >
                                                        <AiOutlineScissor size={20} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="question-footer">
                                        <button
                                            className="answer-button"
                                            onClick={handleAnswerSubmit}
                                            disabled={isAnswered}
                                        >
                                            {isAnswered ? 'Respondida' : 'Responder'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* SIDEBAR DE FILTROS */}
                <aside className="filters-sidebar">
                    <div className="filter-card">
                        <h3 className="filter-title">Filtrar questões</h3>

                        {/* Filtro: ANO */}
                        <div className="filter-group">
                            <label htmlFor="year" className="filter-label">Ano</label>
                            <select
                                name="year"
                                id="year"
                                className="filter-select"
                                value={filters.year}
                                onChange={handleFilterChange}
                            >
                                <option value="" disabled>Selecione o ano</option>
                                {exams.map(exam => (
                                    <option key={exam.year} value={exam.year}>ENEM {exam.year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro: DISCIPLINA */}
                        <div className="filter-group">
                            <label htmlFor="discipline" className="filter-label">Disciplina</label>
                            <select
                                name="discipline"
                                id="discipline"
                                className="filter-select"
                                value={filters.discipline}
                                onChange={handleFilterChange}
                                disabled={!filters.year}
                            >
                                <option value="">Todas</option>
                                {disciplines.map(disc => (
                                    <option key={disc.value} value={disc.value}>{disc.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* --- SELETOR DE LÍNGUA --- */}
                        {filters.year && (
                            <div className="language-selector-container">
                                <label className="filter-label">Língua Estrangeira</label>

                                <div className="language-options">
                                    <label className="language-label">
                                        <input
                                            type="radio"
                                            name="lang"
                                            value="ingles"
                                            className="language-radio"
                                            checked={language === 'ingles'}
                                            onChange={() => handleLanguageChange('ingles')}
                                        />
                                        Inglês
                                    </label>

                                    <label className="language-label">
                                        <input
                                            type="radio"
                                            name="lang"
                                            value="espanhol"
                                            className="language-radio"
                                            checked={language === 'espanhol'}
                                            onChange={() => handleLanguageChange('espanhol')}
                                        />
                                        Espanhol
                                    </label>
                                </div>

                                <small className="language-help-text">
                                    Aplicável apenas nas questões de língua estrangeira (1-5 ou 90-95).
                                </small>
                            </div>
                        )}

                        <button className="filter-button" onClick={handleFilterSubmit}>
                            {loading ? 'Buscando...' : 'Filtrar'}
                        </button>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default Questions;