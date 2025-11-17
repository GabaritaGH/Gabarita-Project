// Gabarita/client/src/pages/home/home.jsx

import React, { useState, useEffect } from "react"; // <-- ADICIONADO useState e useEffect
import { Link } from "react-router-dom";
import "./home.css";
import { AiOutlineSearch } from 'react-icons/ai'; // Ícone de pesquisa
import TopicCard from "../../components/TopicCard/TopicCard.jsx"; // Importa o novo componente

const Home = ( ) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDeletePost = (deletedPostId) => { // <-- NOVO: Função para atualizar a lista
    // Remove o post deletado da lista local
    setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/posts' );
        if (!response.ok) {
          throw new Error('Falha ao buscar posts.');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="community-container">
        <div className="community-card">
          <p>Carregando tópicos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="community-container">
        <div className="community-card">
          <p className="error-message">Erro ao carregar: {error}</p>
        </div>
      </div>
    );
  }

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
          <Link to="/new-post" className="new-topic-button">
            Novo tópico
          </Link>
        </div>

        {/* Seção de Tópicos */}
        <section className="topic-list">
          {posts.length === 0 ? (
            <p>Nenhum tópico encontrado. Crie o primeiro!</p>
          ) : (
            posts.map(post => (
              <TopicCard 
                key={post.id} 
                post={post} 
                onDelete={handleDeletePost} // <-- NOVO: Passa a função de exclusão
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
