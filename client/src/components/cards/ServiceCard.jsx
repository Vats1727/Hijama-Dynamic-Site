import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

const renderServiceIcon = (iconName, fallbackEmoji, size = 44) => {
  if (!iconName) return fallbackEmoji || '';
  if (LucideIcons[iconName]) {
    const IconComponent = LucideIcons[iconName];
    return <IconComponent size={size} />;
  }
  const cleanName = iconName.replace('Lucide', '');
  if (LucideIcons[cleanName]) {
    const IconComponent = LucideIcons[cleanName];
    return <IconComponent size={size} />;
  }
  return iconName;
};

const ServiceCard = ({ icon, name, desc, price, details, image, bgColor }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleFlipBack = (e) => {
    e.stopPropagation();
    setIsFlipped(false);
  };

  return (
    <div className={`service-card ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
      <div className="card-inner">
        <div className="card-front">
          <div className="card-front-top">
            <div className="service-icon">{renderServiceIcon(icon, '🩸', 44)}</div>
            <div className="service-name">{name}</div>
            <p className="service-desc">{desc}</p>
          </div>
          <div className="card-front-bottom">
            <span className="service-price">From {price}</span>
            <span className="flip-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Details
            </span>
          </div>
        </div>
        <div className="card-back">
          <button className="card-flip-back" onClick={handleFlipBack}>✕ flip back</button>
          <div className="card-back-image">
            <div 
              className="card-back-image-bg" 
              style={{ background: bgColor, backgroundImage: `url('${image}')` }}
            ></div>
            <div className="card-back-image-icon">{renderServiceIcon(icon, '🩸', 50)}</div>
            <div className="card-back-image-overlay"></div>
          </div>
          <div className="card-back-body">
            <div className="card-back-title">{name}</div>
            <div className="card-detail-list">
              {details && details.map((detail, index) => (
                <div key={index} className="card-detail-item">{detail}</div>
              ))}
            </div>
            <div className="card-back-footer">
              <span className="card-back-price">From {price}</span>
              <a href="#contact" className="card-book-btn">Book Now</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
