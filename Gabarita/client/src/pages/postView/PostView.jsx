// Gabarita-Project/Gabarita/client/src/pages/postView/PostView.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CommentCard from '../../components/CommentCard/CommentCard.jsx';
import './PostView.css';

const PostView = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}` );
      if (!response.ok) {
        throw new Error('Post não encontrado.');
      }
      const data = await response.json();
      setPost(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: commentText,
          postId: post.id,
        } ),
      });

      if (!response.ok) {
        // Tenta ler a mensagem de erro do backend
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao enviar comentário. Tente novamente.');
      }

      const newComment = await response.json();
      
      // Atualiza o estado local para incluir o novo comentário
      setPost(prevPost => ({
        ...prevPost,
        comments: [...prevPost.comments, newComment],
      }));

      setCommentText('');
    } catch (err) {
      console.error('Erro ao enviar comentário:', err);
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="post-view-container">Carregando tópico...</div>;
  }

  if (error) {
    return <div className="post-view-container error-message">{error}</div>;
  }

  if (!post) {
    return <div className="post-view-container error-message">Post não encontrado.</div>;
  }

  // O primeiro card é o post principal
  const mainPost = {
    id: post.id,
    author: post.author,
    content: post.content,
    createdAt: post.createdAt,
    isMainPost: true,
  };

  // Os demais são os comentários
  const comments = post.comments.map(comment => ({
    ...comment,
    isMainPost: false,
  }));

  // Combina o post principal com os comentários para renderização
  const allItems = [mainPost, ...comments];

  return (
    <div className="post-view-container">
      <Link to="/home" className="back-to-community">
        ← Voltar à página de tópicos
      </Link>

      <h1 className="post-view-title">{post.title}</h1>

      <div className="post-items-list">
        {allItems.map((item) => (
          <CommentCard key={item.id} item={item} />
        ))}
      </div>

      <div className="comment-reply-section">
        <h3 className="reply-title">Responder:</h3>
        <form onSubmit={handleCommentSubmit} className="reply-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Digite sua resposta..."
            required
          />
          <button type="submit" className="reply-button">
            Enviar Resposta
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostView;