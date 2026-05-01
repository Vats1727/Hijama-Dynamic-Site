import React from 'react';

const SectionTitle = ({ tag, title, desc, centered = false, className = '' }) => {
  return (
    <div className={`reveal ${centered ? 'text-center' : ''} ${className}`} style={centered ? { textAlign: 'center', maxWidth: '600px', margin: '0 auto' } : {}}>
      <div className="section-tag" style={centered ? { justifyContent: 'center' } : {}}>{tag}</div>
      <h2 className="section-title" dangerouslySetInnerHTML={{ __html: title }}></h2>
      {desc && <p className="section-desc" style={centered ? { margin: '0 auto' } : {}}>{desc}</p>}
    </div>
  );
};

export default SectionTitle;
