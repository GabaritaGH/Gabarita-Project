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
  // stage: 'config' | 'active' | 'result' | 'review'
  const [stage, setStage] = useState('config'); 
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
    // Se estiver em modo de revisão, não permite trocar a resposta
    if (stage === 'review') return;

    if (!questions[currentIndex]) return;
    const q = questions[currentIndex];
    const qId = q.id || q._id || q.index;

    setUserAnswers(prev => ({ ...prev, [qId]: optionChar }));
  };

  // 3. FINALIZAR
  const handleFinish = async () => {
    if (!window.confirm("Deseja finalizar o simulado agora?")) return;
  
    // Calcular acertos localmente
    let acertos = 0;
    const answersPayload = []; 

    questions.forEach(q => {
      const qId = q.id || q._id || q.index;
      const userAns = userAnswers[qId];
      // Verifica se existe resposta e se bate com a correta
      const isCorrect = userAns === q.correctAlternative;

      if (isCorrect) acertos++;

      if (userAns) {
        answersPayload.push({
          questionId: qId,
          questionYear: q.year,
          selectedOption: userAns,
          isCorrect: isCorrect
        });
      }
    });

    setScore(acertos);
  
    // Enviar para o Backend
    const storedUserId = localStorage.getItem('userId');
  
    if (testId && storedUserId) {
      setIsLoading(true); 
      try {
        await fetch(`${API_URL}/tests/finish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: storedUserId,
            testId: testId,
            answers: answersPayload
          })
        });
      } catch (error) {
        console.error(error);
        alert("Erro ao salvar histórico, mas seu resultado está disponível.");
      } finally {
        setIsLoading(false);
      }
    }

    setStage('result');
  };

  // 4. FUNÇÃO PARA ENTRAR NO MODO REVISÃO
  const handleReviewQuestion = (index) => {
    setCurrentIndex(index);
    setStage('review');
  };

  // --- HELPER: Renderiza texto limpo ---
  const renderTextBody = (text) => {
    if (!text) return null;
    const cleanText = text.replace(/!\[.*?\]\(.*?\)/g, '');
    return cleanText.split('\n').map((line, i) => (
      line.trim() !== '' && <p key={i} className="q-paragraph">{line}</p>
    ));
  };

  // --- HELPER: Define classes CSS para as alternativas (Visual da Revisão) ---
  const getAlternativeClass = (q, altLetter) => {
    // 1. Classe base
    let className = 'alt-btn';
    
    // Pega o ID e a resposta dada
    const qId = q.id || q._id || q.index;
    const userAnswer = userAnswers[qId];
    
    // Se estiver respondendo (active), só marca a selecionada de azul
    if (stage === 'active') {
        if (userAnswer === altLetter) return `${className} selected`;
        return className;
    }

    // Se estiver revisando (review):
    if (stage === 'review') {
        // A alternativa é a correta? -> Verde
        if (q.correctAlternative === altLetter) {
            return `${className} correct-answer`; 
        }
        // A alternativa foi a que o usuário marcou E está errada? -> Vermelho
        if (userAnswer === altLetter && userAnswer !== q.correctAlternative) {
            return `${className} wrong-answer`;
        }
        // Se o usuário marcou essa e acertou, já caiu no primeiro if (verde),
        // então aqui sobram apenas as alternativas neutras.
    }

    return className;
  };

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

          {/* TELA 2 e 4: PROVA ATIVA OU REVISÃO */}
          {(stage === 'active' || stage === 'review') && questions.length > 0 && currentQ && (
            <div className="question-card">
              
              {/* Header Visual da Questão */}
              {stage === 'review' && (
                  <div className="review-banner">
                      MODO DE REVISÃO
                  </div>
              )}

              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>

              <div className="q-header">
                <span>QUESTÃO {currentIndex + 1} DE {questions.length}</span>
                <span>{currentQ.year} | {currentQ.discipline}</span>
              </div>

              <div className="q-enunciado">
                <h3 className="q-title-text">{currentQ.title}</h3>
                <div className="q-context">{renderTextBody(currentQ.context)}</div>
                
                {currentQ.files && currentQ.files.length > 0 && (
                  <div className="q-images">
                    {currentQ.files.map((imgUrl, idx) => (
                      <img key={idx} src={imgUrl} alt={`Figura ${idx}`} className="q-img-responsive" />
                    ))}
                  </div>
                )}

                {currentQ.alternativesIntroduction && (
                  <div className="q-command"><p>{currentQ.alternativesIntroduction}</p></div>
                )}
              </div>

              {/* Lista de Alternativas (COM LOGICA DE CORES NOVA) */}
              <div className="alternatives-list">
                {currentQ.alternatives?.map((alt) => (
                  <button
                    key={alt.letter}
                    className={getAlternativeClass(currentQ, alt.letter)}
                    onClick={() => handleOptionSelect(alt.letter)}
                    disabled={stage === 'review'} // Bloqueia clique na revisão
                  >
                    <div className="alt-letter-box">{alt.letter}</div>
                    <div className="alt-text-content">
                        {alt.file && <img src={alt.file} alt="Alt" className="alt-img" />}
                        {alt.text && <span>{alt.text}</span>}
                    </div>
                  </button>
                ))}
              </div>

              {/* Rodapé de Navegação */}
              <div className="q-footer">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="btn-nav"
                >
                  Anterior
                </button>

                {/* Se estiver no ultimo slide: Finalizar ou Voltar p/ Resultado */}
                {currentIndex === questions.length - 1 ? (
                   stage === 'active' ? (
                     <button className="btn-finish" onClick={handleFinish}>Finalizar Prova</button>
                   ) : (
                     <button className="btn-finish" onClick={() => setStage('result')}>Voltar ao Resultado</button>
                   )
                ) : (
                  <button className="btn-nav" onClick={() => setCurrentIndex(prev => prev + 1)}>Próxima</button>
                )}
                
                {/* Botão extra para voltar ao resultado a qualquer momento na revisão */}
                {stage === 'review' && currentIndex !== questions.length - 1 && (
                    <button className="btn-outline" onClick={() => setStage('result')}>
                        Voltar ao Resumo
                    </button>
                )}
              </div>
            </div>
          )}

          {/* TELA 3: RESULTADO DETALHADO */}
          {stage === 'result' && (
            <div className="result-card">
              <h2>Resultado Final</h2>
              
              <div className="score-circle">
                <span className="score-number">{score}</span>
                <span className="score-total">/ {questions.length}</span>
              </div>
              
              <p className="result-percent">
                  Você acertou {Math.round((score / questions.length) * 100)}% da prova.
              </p>

              <div className="review-section">
                  <h3>Revise suas respostas:</h3>
                  <p className="review-hint">Clique no número para ver a questão completa.</p>
                  
                  {/* Grid de Resultados (Bolinhas) */}
                  <div className="result-grid">
                      {questions.map((q, idx) => {
                          const qId = q.id || q._id || q.index;
                          const userAns = userAnswers[qId];
                          const isCorrect = userAns === q.correctAlternative;
                          const isAnswered = userAns !== undefined;

                          let statusClass = 'skipped'; 
                          if (isAnswered) {
                              statusClass = isCorrect ? 'correct' : 'wrong';
                          }

                          return (
                              <button 
                                key={idx} 
                                className={`result-dot ${statusClass}`}
                                onClick={() => handleReviewQuestion(idx)}
                                title={isCorrect ? "Acertou" : isAnswered ? "Errou" : "Pulou"}
                              >
                                  {idx + 1}
                              </button>
                          )
                      })}
                  </div>
                  
                  {/* NOVA LEGENDA CORRIGIDA */}
                  <div className="result-legend">
                      <div className="legend-item">
                          <span className="legend-circle correct"></span>
                          <span>Acertou</span>
                      </div>
                      <div className="legend-item">
                          <span className="legend-circle wrong"></span>
                          <span>Errou</span>
                      </div>
                      <div className="legend-item">
                          <span className="legend-circle skipped"></span>
                          <span>Pulou</span>
                      </div>
                  </div>
              </div>

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
              {/* ... Inputs de Configuração (Mantidos iguais) ... */}
              <div className="form-group">
                <label>Área do Conhecimento</label>
                <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="area-select">
                  <option value="" disabled>Selecione...</option>
                  {areasDoConhecimento.map((area) => (
                    <option key={area.id} value={area.id}>{area.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantidade</label>
                <input type="number" min="5" max="90" value={questionQty} onChange={(e) => setQuestionQty(e.target.value)} className="qty-input" />
              </div>
              <button className="btn-gerar" onClick={handleStart} disabled={!selectedArea || isLoading}>
                {isLoading ? 'Gerando...' : 'Começar Agora'}
              </button>
            </div>
          ) : (
            // SIDEBAR DURANTE A PROVA OU REVISÃO
            <div className="simulation-status-card">
              <h3>{stage === 'review' ? 'Navegação (Revisão)' : 'Navegação'}</h3>
              <div className="mini-map">
                {questions.map((q, idx) => {
                  const qId = q.id || q._id || q.index;
                  const isCurrent = currentIndex === idx;
                  
                  // Lógica visual da Sidebar
                  let dotClass = 'dot';
                  if (isCurrent) dotClass += ' current';

                  // Na revisão, mostra se acertou ou errou direto na sidebar também
                  if (stage === 'review' || stage === 'result') {
                      const userAns = userAnswers[qId];
                      if (userAns === q.correctAlternative) dotClass += ' correct-mini';
                      else if (userAns) dotClass += ' wrong-mini';
                  } else {
                      // Durante a prova, só mostra se respondeu
                      if (userAnswers[qId] !== undefined) dotClass += ' answered';
                  }

                  return (
                    <div
                      key={idx}
                      className={dotClass}
                      onClick={() => {
                          // Permite navegar clicando na bolinha tanto na prova quanto na revisão
                          setCurrentIndex(idx);
                          if(stage === 'result') setStage('review');
                      }}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Simulados;