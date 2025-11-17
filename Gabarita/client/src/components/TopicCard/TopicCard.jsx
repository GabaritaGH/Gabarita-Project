// Gabarita-Project/Gabarita/client/src/components/TopicCard/TopicCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';

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
        </div>
        <h3 className="topic-card-title">{post.title}</h3>
        <div className="topic-card-footer">
          <span className="topic-card-author">Por: {post.author.name}</span>
          <span className="topic-card-date-footer"> • {formattedDate}</span>
        </div>
      </div>
    </Link>
  );
};

export default TopicCard;
