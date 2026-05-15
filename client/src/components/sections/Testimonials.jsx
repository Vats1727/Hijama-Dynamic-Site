import React, { useState, useEffect } from 'react';
import SectionTitle from '../common/SectionTitle';
import TestimonialCard from '../cards/TestimonialCard';
import { crudService } from '../../services/crud';
import VisualEditorTrigger from '../VisualEditorTrigger';

const Testimonials = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [headerData, setHeaderData] = useState({
    tag: '',
    title: ''
  });
  const [testimonialsList, setTestimonialsList] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const secRows = await crudService.getAll('testimonial_section');
        const activeSec = (secRows && Array.isArray(secRows)) ? secRows.find(item => item.status === 'Active') : null;
        if (activeSec) {
          setHeaderData({
            tag: activeSec.tag || '',
            title: activeSec.title || ''
          });
        }

        const listRows = await crudService.getAll('testimonials_list');
        if (listRows && Array.isArray(listRows)) {
          const activeList = listRows.filter(item => item.status === 'Active');
          setTestimonialsList(activeList);
        }
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load testimonials data:', err);
        setIsLoaded(true);
      }
    };
    fetchTestimonials();
    
    const handleMsg = (event) => {
      if (event.data && event.data.type === 'LIVE_DATA_REFRESH') {
        fetchTestimonials();
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  return (
    <section id="testimonials" style={{ position: 'relative' }}>
      <VisualEditorTrigger sectionPath="/admin/testimonials_list" />
      <SectionTitle 
        tag={headerData.tag}
        title={headerData.title}
        centered
        className={isLoaded ? 'visible' : ''}
      />
      <div className={`testimonials-grid reveal ${isLoaded ? 'visible' : ''}`}>
        {testimonialsList.map((t, i) => (
          <TestimonialCard 
            key={i} 
            stars={t.stars} 
            text={t.text} 
            author={t.author} 
            role={t.role} 
            avatar={t.profile_image_} 
          />
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
