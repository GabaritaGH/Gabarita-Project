import React, { useState } from 'react';
import './simulado.css';

const API_URL = 'http://localhost:5000/api';

const areasDoConhecimento = [
  { id: 'linguagens', label: 'Linguagens e Códigos' },
  { id: 'ciencias-humanas', label: 'Ciências Humanas' },
  { id: 'ciencias-natureza', label: 'Ciências da Natureza' },
  { id: 'matematica', label: 'Matemática' },
];

const Simulados = () => {
  // --- ESTADOS ---
  const [stage, setStage] = useState('config'); // config | active | result
  const [isLoading, setIsLoading] = useState(false);

  const [selectedArea, setSelectedArea] = useState('');
  const [questionQty, setQuestionQty] = useState(10);

  const [testId, setTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);

  // 1. INICIAR SIMULADO
  const handleStart = async () => {
    if (!selectedArea) return alert("Selecione uma área!");
    const storedUserId = localStorage.getItem('userId');

    // Se não tiver login, avisa (opcional: redirecionar)
    if (!storedUserId) return alert("Faça login para salvar seu progresso!");

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/tests/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedUserId,
          category: selectedArea,
          totalQuestions: parseInt(questionQty)
        })
      });

      if (!response.ok) throw new Error('Erro ao gerar simulado');

      const data = await response.json();

      setTestId(data.testId);
      setQuestions(data.questions);

      setStage('active');
      setCurrentIndex(0);
      setUserAnswers({});

    } catch (error) {
      console.error(error);
      alert("Erro ao buscar questões. Verifique se o servidor está rodando.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. SELECIONAR OPÇÃO
  const handleOptionSelect = (optionChar) => {
    if (!questions[currentIndex]) return;
    const q = questions[currentIndex];
    // Garante um ID único para salvar a resposta
    const qId = q.id || q._id || q.index;

    setUserAnswers(prev => ({ ...prev, [qId]: optionChar }));
  };

  // 3. FINALIZAR
  const handleFinish = () => {
    if (!window.confirm("Deseja finalizar o simulado agora?")) return;

    let acertos = 0;
    questions.forEach(q => {
      const qId = q.id || q._id || q.index;
      // Compara a resposta do usuário com o gabarito (correctAlternative)
      if (userAnswers[qId] === q.correctAlternative) {
        acertos++;
      }
    });

    setScore(acertos);
    setStage('result');
  };

  // --- HELPER: Renderiza texto limpo e parágrafos ---
  const renderTextBody = (text) => {
    if (!text) return null;

    // 1. Remove o código markdown de imagem ![](url) para não duplicar
    const cleanText = text.replace(/!\[.*?\]\(.*?\)/g, '');

    // 2. Quebra em parágrafos para ficar bonito
    return cleanText.split('\n').map((line, i) => (
      line.trim() !== '' && <p key={i} className="q-paragraph">{line}</p>
    ));
  };

  // --- VARIÁVEIS ÚTEIS ---
  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <div className="simulados-container">
      <header className="simulados-header">
        <h1>Simulados</h1>
      </header>

      <div className="simulados-content">

        {/* === ÁREA ESQUERDA (PRINCIPAL) === */}
        <div className="simulados-main-area">

          {/* TELA 1: CONFIGURAÇÃO */}
          {stage === 'config' && (
            <div className="placeholder-text">
              <h3>Configure seu treino na barra lateral 👉</h3>
              <p>Escolha a matéria e a quantidade de questões.</p>
            </div>
          )}

          {/* TELA 2: PROVA ATIVA */}
          {stage === 'active' && questions.length > 0 && currentQ && (
            <div className="question-card">

              {/* Barra de progresso visual */}
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>

              <div className="q-header">
                <span>QUESTÃO {currentIndex + 1} DE {questions.length}</span>
                <span>{currentQ.year} | {currentQ.discipline}</span>
              </div>

              <div className="q-enunciado">
                {/* Título */}
                <h3 className="q-title-text">{currentQ.title}</h3>

                {/* Texto de Apoio (Contexto) */}
                <div className="q-context">
                  {renderTextBody(currentQ.context)}
                </div>

                {/* Imagens da Questão */}
                {currentQ.files && currentQ.files.length > 0 && (
                  <div className="q-images">
                    {currentQ.files.map((imgUrl, idx) => (
                      <img key={idx} src={imgUrl} alt={`Figura ${idx}`} className="q-img-responsive" />
                    ))}
                  </div>
                )}

                {/* Comando da Questão (o que se pede) */}
                {currentQ.alternativesIntroduction && (
                  <div className="q-command">
                    <p>{currentQ.alternativesIntroduction}</p>
                  </div>
                )}
              </div>

              {/* Lista de Alternativas */}
              <div className="alternatives-list">
                {currentQ.alternatives?.map((alt) => {
                  const qId = currentQ.id || currentQ._id || currentQ.index;
                  const isSelected = userAnswers[qId] === alt.letter;

                  return (
                    <button
                      key={alt.letter}
                      className={`alt-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(alt.letter)}
                    >
                      {/* Caixa da Letra (A, B, C...) */}
                      <div className="alt-letter-box">
                        {alt.letter}
                      </div>

                      {/* Texto/Imagem da Alternativa */}
                      <div className="alt-text-content">
                        {/* Se tiver imagem, mostra a imagem */}
                        {alt.file && (
                          <img
                            src={alt.file}
                            alt={`Alternativa ${alt.letter}`}
                            className="alt-img"
                          />
                        )}

                        {/* Se tiver texto, mostra o texto */}
                        {alt.text && <span>{alt.text}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Rodapé: Botões Anterior/Próxima */}
              <div className="q-footer">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="btn-nav"
                >
                  Anterior
                </button>

                {currentIndex === questions.length - 1 ? (
                  <button className="btn-finish" onClick={handleFinish}>Finalizar Prova</button>
                ) : (
                  <button className="btn-nav" onClick={() => setCurrentIndex(prev => prev + 1)}>Próxima</button>
                )}
              </div>
            </div>
          )}

          {/* TELA 3: RESULTADO */}
          {stage === 'result' && (
            <div className="result-card">
              <h2>Resultado Final</h2>
              <div className="score-circle">
                <span className="score-number">{score}</span>
                <span className="score-total">/ {questions.length}</span>
              </div>
              <p>Você acertou {Math.round((score / questions.length) * 100)}% da prova.</p>

              <button className="btn-restart" onClick={() => setStage('config')}>
                Novo Simulado
              </button>
            </div>
          )}
        </div>

        {/* === SIDEBAR (DIREITA) === */}
        <div className="simulados-sidebar">

          {stage === 'config' ? (
            <div className="new-simulation-card">
              <h3>Novo Simulado</h3>

              <div className="form-group">
                <label>Área do Conhecimento</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="area-select"
                >
                  <option value="" disabled>Selecione...</option>
                  {areasDoConhecimento.map((area) => (
                    <option key={area.id} value={area.id}>{area.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantidade de Questões</label>
                <input
                  type="number"
                  min="5" max="90"
                  value={questionQty}
                  onChange={(e) => setQuestionQty(e.target.value)}
                  className="qty-input"
                />
              </div>

              <button
                className="btn-gerar"
                onClick={handleStart}
                disabled={!selectedArea || isLoading}
              >
                {isLoading ? 'Gerando...' : 'Começar Agora'}
              </button>
            </div>
          ) : (
            <div className="simulation-status-card">
              <h3>Navegação</h3>
              <div className="mini-map">
                {questions.map((q, idx) => {
                  const qId = q.id || q._id || q.index;
                  const isAnswered = userAnswers[qId] !== undefined;
                  const isCurrent = currentIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`dot ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
                      onClick={() => {
                        if (stage === 'active') setCurrentIndex(idx);
                      }}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
              <div className="mini-map-legend">
                <span className="legend-item"><span className="dot answered sm"></span> Respondida</span>
                <span className="legend-item"><span className="dot current sm"></span> Atual</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Simulados;