import React from 'react';

const renderAvatar = (avatarInput) => {
  if (!avatarInput) return <div className="doctor-avatar">👨‍⚕️</div>;
  if (avatarInput.startsWith('http://') || avatarInput.startsWith('https://') || avatarInput.startsWith('upload/') || avatarInput.startsWith('/upload/')) {
    const src = avatarInput.startsWith('upload/') ? `/server/${avatarInput}` : (avatarInput.startsWith('/upload/') ? `/server${avatarInput}` : avatarInput);
    return (
      <div className="doctor-avatar" style={{ overflow: 'hidden', padding: 0 }}>
        <img src={src} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  return <div className="doctor-avatar">{avatarInput}</div>;
};

const parseTags = (tagsInput) => {
  if (!tagsInput) return [];
  if (Array.isArray(tagsInput)) return tagsInput;
  if (typeof tagsInput === 'string') {
    try {
      const parsed = JSON.parse(tagsInput);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {}
    return tagsInput.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
};

const DoctorCard = ({ avatar, name, title, bio, tags, experience, patients, rating }) => {
  const doctorTags = parseTags(tags);

  return (
    <div className="doctor-card">
      {renderAvatar(avatar)}
      <div className="doctor-info">
        <div className="doctor-name">{name}</div>
        <div className="doctor-title">{title}</div>
        <p className="doctor-bio">{bio}</p>
        {doctorTags.length > 0 && (
          <div className="doctor-tags">
            {doctorTags.map((tag, index) => (
              <span key={index} className="doctor-tag">{tag}</span>
            ))}
          </div>
        )}
        <div className="doctor-exp">
          <div className="exp-item">
            <div className="exp-num">{experience || '0'}</div>
            <div className="exp-label">Years</div>
          </div>
          {patients && (
            <div className="exp-item">
              <div className="exp-num">{patients}</div>
              <div className="exp-label">Patients</div>
            </div>
          )}
          <div className="exp-item">
            <div className="exp-num">{rating || '5'}</div>
            <div className="exp-label">Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
