import React from 'react';
import * as LucideIcons from 'lucide-react';

const renderBenefitIcon = (iconName, fallbackEmoji) => {
  if (!iconName) return fallbackEmoji || '';
  if (LucideIcons[iconName]) {
    const IconComponent = LucideIcons[iconName];
    return <IconComponent />;
  }
  const cleanName = iconName.replace('Lucide', '');
  if (LucideIcons[cleanName]) {
    const IconComponent = LucideIcons[cleanName];
    return <IconComponent />;
  }
  return iconName;
};

const BenefitCard = ({ icon, title, desc }) => {
  return (
    <div className="benefit-item">
      <div className="benefit-icon">{renderBenefitIcon(icon, '🔴')}</div>
      <div className="benefit-text">
        <strong>{title}</strong>
        {desc}
      </div>
    </div>
  );
};

export default BenefitCard;
