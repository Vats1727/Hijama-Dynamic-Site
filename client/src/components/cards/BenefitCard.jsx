import React from 'react';
import { renderDynamicIcon } from '../../utils/IconRenderer';

const BenefitCard = ({ icon, title, desc }) => {
  return (
    <div className="benefit-item">
      <div className="benefit-icon">{renderDynamicIcon(icon, 24, '🔴')}</div>
      <div className="benefit-text">
        <strong>{title}</strong>
        {desc}
      </div>
    </div>
  );
};

export default BenefitCard;
