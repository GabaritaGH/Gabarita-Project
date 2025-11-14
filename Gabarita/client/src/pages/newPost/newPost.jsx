// Gabarita/client/src/pages/newPost/NewPost.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import './NewPost.css';

const NewPost = () => {
  const [formData, setFormData] = useState({
    title: '',   // Título (Post.title)
    content: '', // Mensagem (Post.content)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Você precisa estar logado para criar um tópico.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Envia o token JWT
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        } ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao criar o tópico.');
      }

      // Se for bem-sucedido, redireciona para a comunidade
      navigate('/home'); 
    } catch (err) {
      setError(err.message || 'Erro ao criar o tópico. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-topic-container">
      <Link to="/home" className="back-link">
        <AiOutlineArrowLeft size={16} /> Voltar para a comunidade
      </Link>

      <h1 className="new-topic-title">Novo tópico</h1>

      <form onSubmit={handleSubmit} className="new-topic-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subject">Assunto:</label>
            <input
              type="text"
              id="subject"
              name="subject"
              placeholder="Digite o assunto"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="title">Título:</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Digite o título"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="content">Mensagem:</label>
          <textarea
            id="content"
            name="content"
            placeholder="Digite o conteúdo"
            value={formData.content}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Criando...' : 'Criar tópico'}
        </button>
      </form>
    </div>
  );
};

export default NewPost;
