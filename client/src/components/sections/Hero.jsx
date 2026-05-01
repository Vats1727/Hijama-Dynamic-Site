import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { crudService } from '../../services/crud';
import { getImageUrl } from '../../services/api';

const Hero = () => {
  const [heroData, setHeroData] = useState({
    badge_text: '',
    title_line_1: '',
    title_line_2_italic: '',
    description: '',
    primary_button: '',
    outline_button: '',
    stat_1_num: '',
    stat_1_label: '',
    stat_2_num: '',
    stat_2_label: '',
    stat_3_num: '',
    stat_3_label: '',
    stat_4_num: '',
    stat_4_label: '',
    background_image_: '',
    background_color_picker_: ''
  });

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const rows = await crudService.getAll('hero_section');
        const activeItem = (rows && Array.isArray(rows)) ? rows.find(item => item.status === 'Active') : null;
        if (activeItem) {
          setHeroData({
            badge_text: activeItem.badge_text || '',
            title_line_1: activeItem.title_line_1 || '',
            title_line_2_italic: activeItem.title_line_2_italic || '',
            description: activeItem.description || '',
            primary_button: activeItem.primary_button || '',
            outline_button: activeItem.outline_button || '',
            stat_1_num: activeItem.stat_1_num || '',
            stat_1_label: activeItem.stat_1_label || '',
            stat_2_num: activeItem.stat_2_num || '',
            stat_2_label: activeItem.stat_2_label || '',
            stat_3_num: activeItem.stat_3_num || '',
            stat_3_label: activeItem.stat_3_label || '',
            stat_4_num: activeItem.stat_4_num || '',
            stat_4_label: activeItem.stat_4_label || '',
            background_image_: activeItem.background_image_ || '',
            background_color_picker_: activeItem.background_color_picker_ || ''
          });
        } else {
          setHeroData({
            badge_text: '',
            title_line_1: '',
            title_line_2_italic: '',
            description: '',
            primary_button: '',
            outline_button: '',
            stat_1_num: '',
            stat_1_label: '',
            stat_2_num: '',
            stat_2_label: '',
            stat_3_num: '',
            stat_3_label: '',
            stat_4_num: '',
            stat_4_label: '',
            background_image_: '',
            background_color_picker_: ''
          });
        }
      } catch (err) {
        console.error('Failed to load hero section data:', err);
        setHeroData({
          badge_text: '',
          title_line_1: '',
          title_line_2_italic: '',
          description: '',
          primary_button: '',
          outline_button: '',
          stat_1_num: '',
          stat_1_label: '',
          stat_2_num: '',
          stat_2_label: '',
          stat_3_num: '',
          stat_3_label: '',
          stat_4_num: '',
          stat_4_label: '',
          background_image_: '',
          background_color_picker_: ''
        });
      }
    };
    fetchHeroData();
  }, []);

  const parseBtn = (btnData) => {
    let label = '';
    let url = '#';
    try {
      if (btnData) {
        if (typeof btnData === 'object') {
          if (btnData.label) label = btnData.label;
          if (btnData.url) url = btnData.url;
        } else if (typeof btnData === 'string') {
          const trimmed = btnData.trim();
          if (trimmed.startsWith('{')) {
            const parsed = JSON.parse(trimmed);
            if (parsed.label) label = parsed.label;
            if (parsed.url) url = parsed.url;
          } else {
            label = btnData;
          }
        }
      }
    } catch (err) {
      console.error('Failed to parse button data:', err);
    }
    return { label, url };
  };

  const primaryBtn = parseBtn(heroData.primary_button);
  const outlineBtn = parseBtn(heroData.outline_button);

  const stats = [
    { num: heroData.stat_1_num, label: heroData.stat_1_label },
    { num: heroData.stat_2_num, label: heroData.stat_2_label },
    { num: heroData.stat_3_num, label: heroData.stat_3_label },
    { num: heroData.stat_4_num, label: heroData.stat_4_label },
  ].filter(s => s.num && s.label);

  const bgUrl = heroData.background_image_ ? getImageUrl(heroData.background_image_) : '';
  const bgColor = heroData.background_color_picker_ || '';

  const sectionStyle = {};
  if (bgUrl) {
    sectionStyle.backgroundImage = `linear-gradient(rgba(26, 18, 9, 0.75), rgba(26, 18, 9, 0.75)), url("${bgUrl}")`;
    sectionStyle.backgroundSize = 'cover';
    sectionStyle.backgroundPosition = 'center';
    sectionStyle.backgroundRepeat = 'no-repeat';
  } else if (bgColor) {
    sectionStyle.backgroundColor = bgColor;
    sectionStyle.backgroundImage = 'none';
  }

  return (
    <section id="home" style={sectionStyle}>
      <div className="hero-pattern"></div>
      <div className="hero-glow"></div>
      <div className="hero-glow2"></div>
      <div className="hero-content">
        {heroData.badge_text && (
          <div className="hero-badge">{heroData.badge_text}</div>
        )}
        {(heroData.title_line_1 || heroData.title_line_2_italic) && (
          <h1 className="hero-title">
            {heroData.title_line_1}{heroData.title_line_1 && <br />}
            {heroData.title_line_2_italic && <em>{heroData.title_line_2_italic}</em>}
          </h1>
        )}
        {heroData.description && (
          <p className="hero-desc">{heroData.description}</p>
        )}
        <div className="hero-btns">
          {primaryBtn.label && (
            <Button href={primaryBtn.url} variant="primary">{primaryBtn.label}</Button>
          )}
          {outlineBtn.label && (
            <Button href={outlineBtn.url} variant="outline">{outlineBtn.label}</Button>
          )}
        </div>
        {stats.length > 0 && (
          <div className="hero-stats">
            {stats.map((stat, i) => (
              <div key={i} className="stat">
                <div className="stat-num">{stat.num}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
