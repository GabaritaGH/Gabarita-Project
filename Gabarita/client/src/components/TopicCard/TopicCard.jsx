import React from 'react';
// O estilo será aplicado via home.css para simplificar a gestão de arquivos

const TopicCard = ({ topic }) => {
  return (
    <div className="topic-card">
      <div className="topic-card-header">{topic.title}</div>
      <div className="topic-card-footer">
        {/* Placeholder para o Avatar */}
        <div className="topic-card-avatar" style={{ backgroundImage: `url(${topic.avatarUrl})` }}></div>
        <div className="topic-card-author">{topic.author}</div>
      </div>
    </div>
  );
};

export default TopicCard;
