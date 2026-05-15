import React, { useState, useEffect } from 'react';
import SectionTitle from '../common/SectionTitle';
import DoctorCard from '../cards/DoctorCard';
import { crudService } from '../../services/crud';
import VisualEditorTrigger from '../VisualEditorTrigger';

const Doctors = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [doctorsHeader, setDoctorsHeader] = useState({
    tag: '',
    title: '',
    desc: ''
  });
  const [doctorsList, setDoctorsList] = useState([]);

  useEffect(() => {
    const fetchDoctorsData = async () => {
      try {
        // Fetch doctors_section
        const secRows = await crudService.getAll('doctors_section');
        const activeSec = (secRows && Array.isArray(secRows)) ? secRows.find(item => item.status === 'Active') : null;
        if (activeSec) {
          setDoctorsHeader({
            tag: activeSec.tag || '',
            title: activeSec.title || '',
            desc: activeSec.desc || ''
          });
        }

        // Fetch doctors_list
        const listRows = await crudService.getAll('doctors_list');
        if (listRows && Array.isArray(listRows)) {
          const activeList = listRows.filter(item => item.status === 'Active');
          setDoctorsList(activeList);
        }
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load doctors data:', err);
        setIsLoaded(true);
      }
    };
    fetchDoctorsData();
    
    const handleMsg = (event) => {
      if (event.data && event.data.type === 'LIVE_DATA_REFRESH') {
        fetchDoctorsData();
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  return (
    <section id="doctors" style={{ position: 'relative' }}>
      <VisualEditorTrigger sectionPath="/admin/doctors_list" />
      <SectionTitle 
        tag={doctorsHeader.tag}
        title={doctorsHeader.title}
        desc={doctorsHeader.desc}
        className={isLoaded ? 'visible' : ''}
      />
      <div className={`doctors-grid reveal ${isLoaded ? 'visible' : ''}`}>
        {doctorsList.map((d, i) => (
          <DoctorCard 
            key={i} 
            avatar={d.image_}
            name={d.name}
            title={d.title}
            bio={d.bio}
            tags={d.tags}
            experience={d.experience}
            patients={d.patients}
            rating={d.rating}
          />
        ))}
      </div>
    </section>
  );
};

export default Doctors;
