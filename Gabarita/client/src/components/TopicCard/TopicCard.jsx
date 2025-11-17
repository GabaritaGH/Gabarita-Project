// Gabarita-Project/Gabarita/client/src/components/TopicCard/TopicCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './TopicCard.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getUserId } from '../../utils/auth.js'; // <-- NOVO: Importa a função utilitária
import axios from 'axios'; // <-- NOVO: Para a chamada DELETE

const TopicCard = ({ post, onDelete }) => { // <-- NOVO: Recebe onDelete
  // Adicionar verificação para evitar o erro "post is undefined"
  if (!post) return null; 

  const currentUserId = getUserId(); // <-- NOVO: Obtém o ID do usuário logado
  const isAuthor = currentUserId === post.author.id; // <-- NOVO: Verifica se é o autor

  const handleDelete = async (e) => { // <-- NOVO: Função para deletar
    e.preventDefault(); // Previne a navegação para o post
    e.stopPropagation(); // Previne que o evento suba para o Link

    if (window.confirm('Tem certeza que deseja deletar este post?')) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`http://localhost:5000/api/posts/${post.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        } );
        // Chama a função onDelete passada pelo componente pai para atualizar a lista
        if (onDelete) {
          onDelete(post.id);
        }
      } catch (error) {
        console.error('Erro ao deletar post:', error);
        alert('Falha ao deletar o post. Verifique se você é o autor.');
      }
    }
  };
  
  const formattedDate = format(new Date(post.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <Link to={`/post/${post.id}`} className="topic-card-link">
      <div className="topic-card">
        <div className="topic-card-header">
          <span className="topic-card-subject">{post.subject}</span>
        </div>
        <h3 className="topic-card-title">{post.title}</h3>
        <div className="topic-card-footer">
          <span className="topic-card-author">Por: {post.author.name}</span>
          <span className="topic-card-date-footer"> • {formattedDate}</span>
          {isAuthor && ( // <-- NOVO: Exibe o botão apenas se for o autor
            <button className="delete-button" onClick={handleDelete}>
              Deletar
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TopicCard;
