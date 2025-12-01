import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './CommentCard.css';

const CommentCard = ({ item }) => {
  const { author, content, createdAt, isMainPost } = item;


  const getAvatar = (name) => {
    return name ? name[0].toUpperCase() : '?';
  };

  const formattedDate = format(new Date(createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });

  return (
    <div className={`comment-card ${isMainPost ? 'main-post-card' : 'reply-card'}`}>
      <div className="comment-header">
        <div className="comment-avatar">{getAvatar(author.name)}</div>
        <div className="comment-info">
          <span className="comment-author">{author.name}</span>
          <span className="comment-date">{formattedDate}</span>
        </div>
      </div>
      <div className="comment-content">
        {isMainPost && <h2 className="post-content-title">Conteúdo do Tópico:</h2>}
        <p>{content}</p>
      </div>
    </div>
  );
};

export default CommentCard;