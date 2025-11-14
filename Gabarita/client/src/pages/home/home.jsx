// Gabarita/client/src/pages/home/home.jsx

import React from "react";
import "./home.css";
import { AiOutlineSearch } from 'react-icons/ai'; // Ícone de pesquisa
import TopicCard from "../../components/TopicCard/TopicCard.jsx"; // Importa o novo componente

// Dados mockados baseados na sua print
const mockTopics = [
  { id: 1, title: 'Competência 1', author: 'Clara', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, title: 'Geo Analítica', author: 'Thiago', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, title: 'Ecologia', author: 'Miguel', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, title: 'Bionômio de Newton', author: 'Clara', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
];

const Home = ( ) => {
  return (
    <div className="community-container">
      <div className="community-card">
      {/* Cabeçalho e Barra de Pesquisa */}
      <header className="community-header">
        <h1 className="community-title">Comunidade:</h1>
        <div className="search-bar-container">
          <input type="text" placeholder="Pesquise" className="search-input" />
          <button className="search-button">
            <AiOutlineSearch size={20} />
          </button>
        </div>
      </header>

      {/* Botão Novo Tópico */}
      <div className="new-topic-section">
        <button className="new-topic-button">Novo tópico</button>
      </div>

      {/* Seção de Tópicos */}
      <section className="topic-list">
        {mockTopics.map(topic => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </section>
      </div>
    </div>
  );
};

export default Home;
