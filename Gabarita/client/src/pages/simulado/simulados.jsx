import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './simulado.css'; 

// --- CORREÇÃO: A lista fica fora do componente ou no topo dele ---
const areasDoConhecimento = [
  { id: 'linguagens', label: 'Linguagens, Códigos e suas Tecnologias' },
  { id: 'ciencias-humanas', label: 'Ciências Humanas e suas Tecnologias' },
  { id: 'ciencias-natureza', label: 'Ciências da Natureza e suas Tecnologias' },
  { id: 'matematica', label: 'Matemática e suas Tecnologias' },
];

const Simulados = () => {
  const navigate = useNavigate();
  const [selectedArea, setSelectedArea] = useState('');

  const handleGenerate = () => {
    if (!selectedArea) {
      alert("Por favor, selecione uma área do conhecimento.");
      return;
    }

    console.log("Gerando simulado para:", selectedArea);
    
    // Aqui virá a lógica de navegação. Exemplo:
    // navigate(`/questoes?disciplina=${selectedArea}&modo=simulado`);
  };

  return (
    <div className="simulados-container">
      <header className="simulados-header">
        <h1>Simulados</h1>
      </header>

      <div className="simulados-content">
        {/* LADO ESQUERDO: Área Visual / Placeholder */}
        <div className="simulados-placeholder">
          <div className="placeholder-text">
            <h3>Filtre para criar seu simulado</h3>
            <p>Ele será composto por 45 questões da área que você escolher</p>
          </div>
        </div>

        {/* LADO DIREITO: Painel de Criação */}
        <div className="simulados-sidebar">
          <div className="new-simulation-card">
            <h3>Novo simulado</h3>
            
            <div className="form-group">
              <label htmlFor="area-select">Área do conhecimento</label>
              <select 
                id="area-select"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="area-select"
              >
                <option value="" disabled>Selecione uma área</option>
                {/* Agora o .map vai funcionar porque a variável está visível */}
                {areasDoConhecimento.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.label}
                  </option>
                ))}
              </select>
            </div>

            <button 
              className="btn-gerar" 
              onClick={handleGenerate}
              disabled={!selectedArea} 
            >
              Gerar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulados;