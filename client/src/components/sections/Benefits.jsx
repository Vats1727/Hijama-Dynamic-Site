import React, { useState, useEffect } from 'react';
import SectionTitle from '../common/SectionTitle';
import BenefitCard from '../cards/BenefitCard';
import { crudService } from '../../services/crud';

const Benefits = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hijamaData, setHijamaData] = useState({
    tag: '',
    title: '',
    desc: '',
    journey_title: '',
    benefit_1_icon: '',
    benefit_1_title: '',
    benefit_1_desc: '',
    benefit_2_icon: '',
    benefit_2_title: '',
    benefit_2_desc: '',
    benefit_3_icon: '',
    benefit_3_title: '',
    benefit_3_desc: '',
    benefit_4_icon: '',
    benefit_4_title: '',
    benefit_4_desc: '',
    benefit_5_icon: '',
    benefit_5_title: '',
    benefit_5_desc: '',
    benefit_6_icon: '',
    benefit_6_title: '',
    benefit_6_desc: '',
    step_1_title: '',
    step_1_desc: '',
    step_2_title: '',
    step_2_desc: '',
    step_3_title: '',
    step_3_desc: '',
    step_4_title: '',
    step_4_desc: '',
    step_5_title: '',
    step_5_desc: ''
  });

  useEffect(() => {
    const fetchBenefitsData = async () => {
      try {
        const rows = await crudService.getAll('why_hijama');
        const activeItem = (rows && Array.isArray(rows)) ? rows.find(item => item.status === 'Active') : null;
        if (activeItem) {
          setHijamaData({
            tag: activeItem.tag || '',
            title: activeItem.title || '',
            desc: activeItem.desc || '',
            journey_title: activeItem.journey_title || '',
            benefit_1_icon: activeItem.benefit_1_icon || '',
            benefit_1_title: activeItem.benefit_1_title || '',
            benefit_1_desc: activeItem.benefit_1_desc || '',
            benefit_2_icon: activeItem.benefit_2_icon || '',
            benefit_2_title: activeItem.benefit_2_title || '',
            benefit_2_desc: activeItem.benefit_2_desc || '',
            benefit_3_icon: activeItem.benefit_3_icon || '',
            benefit_3_title: activeItem.benefit_3_title || '',
            benefit_3_desc: activeItem.benefit_3_desc || '',
            benefit_4_icon: activeItem.benefit_4_icon || '',
            benefit_4_title: activeItem.benefit_4_title || '',
            benefit_4_desc: activeItem.benefit_4_desc || '',
            benefit_5_icon: activeItem.benefit_5_icon || '',
            benefit_5_title: activeItem.benefit_5_title || '',
            benefit_5_desc: activeItem.benefit_5_desc || '',
            benefit_6_icon: activeItem.benefit_6_icon || '',
            benefit_6_title: activeItem.benefit_6_title || '',
            benefit_6_desc: activeItem.benefit_6_desc || '',
            step_1_title: activeItem.step_1_title || '',
            step_1_desc: activeItem.step_1_desc || '',
            step_2_title: activeItem.step_2_title || '',
            step_2_desc: activeItem.step_2_desc || '',
            step_3_title: activeItem.step_3_title || '',
            step_3_desc: activeItem.step_3_desc || '',
            step_4_title: activeItem.step_4_title || '',
            step_4_desc: activeItem.step_4_desc || '',
            step_5_title: activeItem.step_5_title || '',
            step_5_desc: activeItem.step_5_desc || ''
          });
          setIsLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load benefits data:', err);
        setIsLoaded(true);
      }
    };
    fetchBenefitsData();
  }, []);

  const benefits = [
    { icon: hijamaData.benefit_1_icon, title: hijamaData.benefit_1_title, desc: hijamaData.benefit_1_desc },
    { icon: hijamaData.benefit_2_icon, title: hijamaData.benefit_2_title, desc: hijamaData.benefit_2_desc },
    { icon: hijamaData.benefit_3_icon, title: hijamaData.benefit_3_title, desc: hijamaData.benefit_3_desc },
    { icon: hijamaData.benefit_4_icon, title: hijamaData.benefit_4_icon, desc: hijamaData.benefit_4_desc },
    { icon: hijamaData.benefit_5_icon, title: hijamaData.benefit_5_title, desc: hijamaData.benefit_5_desc },
    { icon: hijamaData.benefit_6_icon, title: hijamaData.benefit_6_title, desc: hijamaData.benefit_6_desc },
  ].filter(b => b.title && b.desc);

  const steps = [
    { num: 1, title: hijamaData.step_1_title, desc: hijamaData.step_1_desc },
    { num: 2, title: hijamaData.step_2_title, desc: hijamaData.step_2_desc },
    { num: 3, title: hijamaData.step_3_title, desc: hijamaData.step_3_desc },
    { num: 4, title: hijamaData.step_4_title, desc: hijamaData.step_4_desc },
    { num: 5, title: hijamaData.step_5_title, desc: hijamaData.step_5_desc },
  ].filter(s => s.title && s.desc);

  return (
    <section id="benefits">
      <div className="benefits-layout">
        <div>
          <SectionTitle 
            tag={hijamaData.tag}
            title={hijamaData.title}
            desc={hijamaData.desc}
            className={isLoaded ? 'visible' : ''}
          />
          <div className={`benefits-list reveal ${isLoaded ? 'visible' : ''}`}>
            {benefits.map((b, i) => (
              <BenefitCard key={i} {...b} />
            ))}
          </div>
        </div>
        <div className={`benefits-visual reveal ${isLoaded ? 'visible' : ''}`}>
          <h3>{hijamaData.journey_title || 'Your Healing Journey'}</h3>
          <div className="process-steps">
            {steps.map((step, i) => (
              <div key={i} className="process-step">
                <div className="step-line-wrap">
                  <div className="step-num">{step.num}</div>
                  {i < steps.length - 1 && <div className="step-connector"></div>}
                </div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  <div className="step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
