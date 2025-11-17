import React from 'react';
import { Link } from 'react-router-dom';
import './TopicCard.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TopicCard = ({ post }) => {
  // Adicionar verificação para evitar o erro "post is undefined"
  if (!post) return null; 

  const formattedDate = format(new Date(post.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <Link to={`/post/${post.id}`} className="topic-card-link">
      <div className="topic-card">
        <div className="topic-card-header">
          <span className="topic-card-subject">{post.subject}</span>
          {/* A data foi removida daqui */}
        </div>
        <h3 className="topic-card-title">{post.title}</h3>
        <div className="topic-card-footer">
          <span className="topic-card-author">Por: {post.author.name}</span>
          {/* A data foi adicionada aqui com um novo span e um separador */}
          <span className="topic-card-date-footer"> • {formattedDate}</span>
        </div>
      </div>
    </Link>
  );
};

export default TopicCard;
