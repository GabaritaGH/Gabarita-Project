import React from 'react';
// O estilo será aplicado via home.css para simplificar a gestão de arquivos

const TopicCard = ({ topic }) => {
  // O objeto 'topic' agora é um objeto 'post' do backend
  const authorName = topic.author?.name || 'Autor Desconhecido';
  // Avatar mockado baseado no ID do autor (para simular a imagem)
  const avatarUrl = `https://i.pravatar.cc/150?img=${topic.authorId % 20}`; 
  
  return (
    <div className="topic-card">
      <div className="topic-card-header">{topic.title}</div>
      <div className="topic-card-footer">
        {/* Avatar mockado baseado no ID do autor */}
        <div className="topic-card-avatar" style={{ backgroundImage: `url(${avatarUrl} )` }}></div>
        <div className="topic-card-author">{authorName}</div>
      </div>
    </div>
  );
};

export default TopicCard;
