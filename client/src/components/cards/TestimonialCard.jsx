import React from 'react';

const renderStars = (starsInput) => {
  if (typeof starsInput === 'number' || !isNaN(starsInput)) {
    const num = parseInt(starsInput, 10);
    return '★'.repeat(num || 5);
  }
  return starsInput || '★★★★★';
};

const renderAvatar = (avatarInput) => {
  if (!avatarInput) return <div className="author-avatar">👤</div>;
  if (avatarInput.startsWith('http://') || avatarInput.startsWith('https://') || avatarInput.startsWith('upload/') || avatarInput.startsWith('/upload/')) {
    const src = avatarInput.startsWith('upload/') ? `/server/${avatarInput}` : (avatarInput.startsWith('/upload/') ? `/server${avatarInput}` : avatarInput);
    return (
      <div className="author-avatar" style={{ overflow: 'hidden', padding: 0 }}>
        <img src={src} alt="Author" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  return <div className="author-avatar">{avatarInput}</div>;
};

const TestimonialCard = ({ stars, text, author, role, avatar }) => {
  return (
    <div className="testimonial-card">
      <div className="stars">{renderStars(stars)}</div>
      <div className="testimonial-quote">"</div>
      <p className="testimonial-text">{text}</p>
      <div className="testimonial-author">
        {renderAvatar(avatar)}
        <div>
          <div className="author-name">{author}</div>
          <div className="author-role">{role}</div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
