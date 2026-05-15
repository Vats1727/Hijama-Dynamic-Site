import React, { useState, useEffect } from 'react';
import SectionTitle from '../common/SectionTitle';
import { crudService } from '../../services/crud';
import { renderDynamicIcon } from '../../utils/IconRenderer';
import VisualEditorTrigger from '../VisualEditorTrigger';

const About = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [aboutData, setAboutData] = useState({
    tag: '',
    title: '',
    desc: '',
    visual_icon: '',
    quote_text: '',
    additional_text: '',
    feature_1_icon: '',
    feature_1_title: '',
    feature_1_desc: '',
    feature_2_icon: '',
    feature_2_title: '',
    feature_2_desc: '',
    feature_3_icon: '',
    feature_3_title: '',
    feature_3_desc: '',
    feature_4_icon: '',
    feature_4_title: '',
    feature_4_desc: ''
  });

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const rows = await crudService.getAll('about_section');
        const activeItem = (rows && Array.isArray(rows)) ? rows.find(item => item.status === 'Active') : null;
        if (activeItem) {
          setAboutData({
            tag: activeItem.tag || '',
            title: activeItem.title || '',
            desc: activeItem.desc || '',
            visual_icon: activeItem.visual_icon || '',
            quote_text: activeItem.quote_text || '',
            additional_text: activeItem.additional_text || '',
            feature_1_icon: activeItem.feature_1_icon || '',
            feature_1_title: activeItem.feature_1_title || '',
            feature_1_desc: activeItem.feature_1_desc || '',
            feature_2_icon: activeItem.feature_2_icon || '',
            feature_2_title: activeItem.feature_2_title || '',
            feature_2_desc: activeItem.feature_2_desc || '',
            feature_3_icon: activeItem.feature_3_icon || '',
            feature_3_title: activeItem.feature_3_title || '',
            feature_3_desc: activeItem.feature_3_desc || '',
            feature_4_icon: activeItem.feature_4_icon || '',
            feature_4_title: activeItem.feature_4_title || '',
            feature_4_desc: activeItem.feature_4_desc || ''
          });
          setIsLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load about section data:', err);
      }
    };
    fetchAboutData();
    
    const handleMsg = (event) => {
      if (event.data && event.data.type === 'LIVE_DATA_REFRESH') {
        fetchAboutData();
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const features = [
    { icon: aboutData.feature_1_icon, title: aboutData.feature_1_title, desc: aboutData.feature_1_desc },
    { icon: aboutData.feature_2_icon, title: aboutData.feature_2_title, desc: aboutData.feature_2_desc },
    { icon: aboutData.feature_3_icon, title: aboutData.feature_3_title, desc: aboutData.feature_3_desc },
    { icon: aboutData.feature_4_icon, title: aboutData.feature_4_title, desc: aboutData.feature_4_desc },
  ].filter(f => f.title && f.desc);

  const formatWithBr = (text) => {
    if (!text) return '';
    return text.split('<br>').map((line, idx) => (
      <React.Fragment key={idx}>
        {line}
        {idx !== text.split('<br>').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const formatQuoteWithBr = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, idx) => (
      <React.Fragment key={idx}>
        {line}
        {idx !== text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <section id="about" style={{ position: 'relative' }}>
      <VisualEditorTrigger sectionPath="/admin/about_section" />
      <SectionTitle 
        tag={aboutData.tag}
        title={aboutData.title}
        desc={aboutData.desc}
        className={isLoaded ? 'visible' : ''}
      />
      <div className="about-grid">
        <div className={`about-visual reveal ${isLoaded ? 'visible' : ''}`}>
          <div className="about-visual-inner">
            <span className="about-visual-icon">{renderDynamicIcon(aboutData.visual_icon, 80, "⚕️")}</span>
            <div className="about-visual-text">
              {formatQuoteWithBr(aboutData.quote_text)}
            </div>
          </div>
          <div className="about-accent"></div>
        </div>
        <div className={`reveal ${isLoaded ? 'visible' : ''}`}>
          {aboutData.additional_text && (
            <p style={{ color: 'var(--text-light)', lineHeight: '1.8', marginBottom: '24px' }}>
              {aboutData.additional_text}
            </p>
          )}
          {features.length > 0 && (
            <div className="about-features">
              {features.map((f, i) => (
                <div key={i} className="about-feature">
                  <div className="feature-icon">{renderDynamicIcon(f.icon, 24, "🏥")}</div>
                  <div>
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default About;
