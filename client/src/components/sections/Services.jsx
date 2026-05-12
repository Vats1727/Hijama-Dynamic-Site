import React, { useState, useEffect } from 'react';
import SectionTitle from '../common/SectionTitle';
import ServiceCard from '../cards/ServiceCard';
import { crudService } from '../../services/crud';

const Services = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [servicesHeader, setServicesHeader] = useState({
    tag: '',
    title: '',
    desc_: ''
  });
  const [servicesList, setServicesList] = useState([]);

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        // Fetch services_section
        const secRows = await crudService.getAll('services_section');
        const activeSec = (secRows && Array.isArray(secRows)) ? secRows.find(item => item.status === 'Active') : null;
        if (activeSec) {
          setServicesHeader({
            tag: activeSec.tag || '',
            title: activeSec.title || '',
            desc_: activeSec.desc_ || ''
          });
        }

        // Fetch service_list
        const listRows = await crudService.getAll('service_list');
        if (listRows && Array.isArray(listRows)) {
          const activeList = listRows.filter(item => item.status === 'Active');
          setServicesList(activeList);
        }
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load services data:', err);
        setIsLoaded(true);
      }
    };
    fetchServicesData();
  }, []);

  const parseDetails = (detailsInput) => {
    if (!detailsInput) return [];
    if (Array.isArray(detailsInput)) return detailsInput;
    if (typeof detailsInput === 'string') {
      return detailsInput.split('\n').map(d => d.trim()).filter(Boolean);
    }
    return [];
  };

  const resolveImage = (imgPath) => {
    if (!imgPath) return '';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
    if (imgPath.startsWith('upload/')) return `${import.meta.env.VITE_API_URL || '/server'}/${imgPath}`;
    if (imgPath.startsWith('/upload/')) return `${import.meta.env.VITE_API_URL || '/server'}${imgPath}`;
    return imgPath;
  };

  return (
    <section id="services">
      <SectionTitle 
        tag={servicesHeader.tag}
        title={servicesHeader.title}
        desc={servicesHeader.desc_}
        centered
        className={isLoaded ? 'visible' : ''}
      />
      <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem', marginTop: '12px', opacity: '0.7' }}>
        ðŸ‘† Click any card to see full details
      </p>
      <div className={`services-grid reveal ${isLoaded ? 'visible' : ''}`}>
        {servicesList.map((s, i) => (
          <ServiceCard 
            key={i} 
            icon={s.icon}
            name={s.name}
            desc={s.desc}
            price={s.price}
            bgColor={s.bgColor}
            image={resolveImage(s.image)}
            details={parseDetails(s.details)}
          />
        ))}
      </div>
    </section>
  );
};

export default Services;

