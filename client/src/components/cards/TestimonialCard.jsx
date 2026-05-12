import React from 'react';
import { Star, User } from 'lucide-react';

const renderStars = (starsInput) => {
  const val = parseInt(starsInput, 10) || 5;
  const validNum = Math.min(Math.max(val, 1), 5); // Clamp between 1 and 5
  
  return Array.from({ length: validNum }).map((_, i) => (
    <Star key={i} size={16} fill="currentColor" stroke="none" style={{ marginRight: '2px' }} />
  ));
};

const renderAvatar = (avatarInput) => {
  if (!avatarInput) {
    return (
      <div className="author-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--border)' }}>
        <User size={24} style={{ opacity: 0.5 }} />
      </div>
    );
  }
  if (avatarInput.startsWith('http://') || avatarInput.startsWith('https://') || avatarInput.startsWith('upload/') || avatarInput.startsWith('/upload/')) {
    const src = avatarInput.startsWith('upload/') ? `${import.meta.env.VITE_API_URL || '/server'}/${avatarInput}` : (avatarInput.startsWith('/upload/') ? `${import.meta.env.VITE_API_URL || '/server'}${avatarInput}` : avatarInput);
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

