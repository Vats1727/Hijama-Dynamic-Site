import React, { useState, useEffect } from 'react';
import { crudService } from '../../services/crud';
import * as LucideIcons from 'lucide-react';
import VisualEditorTrigger from '../VisualEditorTrigger';

// --- PREMIUM CUSTOM BRAND ICONS (Required as Lucide-React v1.x dropped brand logos!) ---
const FacebookIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

const YoutubeIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
    <polygon points="10 15 15 12 10 9"></polygon>
  </svg>
);

const renderLogo = (logoValue) => {
  if (!logoValue) return <a href="#home" className="nav-logo"><LucideIcons.Moon size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Al-<span>Shifa</span></a>;
  
  if (typeof logoValue === 'string') {
    if (logoValue.startsWith('upload/') || logoValue.startsWith('/upload/') || logoValue.startsWith('http')) {
      const src = logoValue.startsWith('upload/') ? `${import.meta.env.VITE_API_URL || '/server'}/${logoValue}` : (logoValue.startsWith('/upload/') ? `${import.meta.env.VITE_API_URL || '/server'}${logoValue}` : logoValue);
      return (
        <a href="#home" className="nav-logo">
          <img src={src} alt="Al-Shifa" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
        </a>
      );
    }
    // Decode legacy character encoding artifact for Crescent Moon if any
    const cleaned = logoValue.replace(/â˜½/g, '🌙');
    return <a href="#home" className="nav-logo">{cleaned}</a>;
  }
  return <a href="#home" className="nav-logo">{logoValue}</a>;
};

const renderSocialIcon = (nameOrEmoji, fallbackIcon) => {
  if (!nameOrEmoji) return fallbackIcon;

  // 1. CRITICAL: ROBUST MOJIBAKE DECODING (Translates corrupted database strings into beautiful icons!)
  const valStr = typeof nameOrEmoji === 'string' ? nameOrEmoji.trim() : '';
  if (valStr.includes('ðŸ“˜')) return <FacebookIcon size={20} />;
  if (valStr.includes('ðŸ“¸')) return <InstagramIcon size={20} />;
  if (valStr.includes('â–¶')) return <YoutubeIcon size={20} />;
  if (valStr.includes('ðŸ’¬')) return <LucideIcons.MessageCircle size={20} />;

  // 2. Try rendering direct Lucide Icon name
  if (LucideIcons[nameOrEmoji] && typeof LucideIcons[nameOrEmoji] === 'function') {
    const IconComponent = LucideIcons[nameOrEmoji];
    return <IconComponent size={20} />;
  }

  const cleanName = nameOrEmoji.replace('Lucide', '');
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const candidate = capitalize(cleanName);

  if (LucideIcons[candidate] && typeof LucideIcons[candidate] === 'function') {
    const IconComponent = LucideIcons[candidate];
    return <IconComponent size={20} />;
  }

  // 3. Fallback contextual mapping
  const lower = nameOrEmoji.toLowerCase();
  if (lower.includes('fb') || lower.includes('face')) return <FacebookIcon size={20} />;
  if (lower.includes('insta')) return <InstagramIcon size={20} />;
  if (lower.includes('yt') || lower.includes('you')) return <YoutubeIcon size={20} />;
  if (lower.includes('wa') || lower.includes('what')) return <LucideIcons.MessageCircle size={20} />;

  // Return custom text or emoji if it is valid UTF8, otherwise fallbackIcon
  return nameOrEmoji.length > 0 && !nameOrEmoji.includes('ð') ? nameOrEmoji : fallbackIcon;
};

const Footer = () => {
  const [services, setServices] = useState([]);
  const [footerData, setFooterData] = useState({
    logo: '',
    brand_desc: '',
    facebook: '',
    facebook_link: '',
    instagram: '',
    instagram_link: '',
    youtube: '',
    youtube_link: '',
    whatsapp: '',
    whatsapp_link: '',
    copyright: '',
    privacy: '',
    privacy_link: '',
    terms_: '',
    terms_link: '',
    site_maps_: '',
    site_maps_link: ''
  });

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const rows = await crudService.getAll('footer');
        const activeItem = (rows && Array.isArray(rows)) ? rows.find(item => item.status === 'Active') : null;
        if (activeItem) {
          setFooterData({
            logo: activeItem.logo || '',
            brand_desc: activeItem.brand_desc || '',
            facebook: activeItem.facebook || '',
            facebook_link: activeItem.facebook_link || '',
            instagram: activeItem.instagram || '',
            instagram_link: activeItem.instagram_link || '',
            youtube: activeItem.youtube || '',
            youtube_link: activeItem.youtube_link || '',
            whatsapp: activeItem.whatsapp || '',
            whatsapp_link: activeItem.whatsapp_link || '',
            copyright: activeItem.copyright || '',
            privacy: activeItem.privacy || '',
            privacy_link: activeItem.privacy_link || '',
            terms_: activeItem.terms_ || '',
            terms_link: activeItem.terms_link || '',
            site_maps_: activeItem.site_maps_ || '',
            site_maps_link: activeItem.site_maps_link || ''
          });
        }
      } catch (err) {
        console.error('Failed to load footer data:', err);
      }
    };

    const fetchServices = async () => {
      try {
        const rows = await crudService.getAll('service_list');
        if (rows && Array.isArray(rows)) {
          setServices(rows.filter(s => s.status?.toLowerCase() === 'active'));
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      }
    };

    fetchFooter();
    fetchServices();
    
    const handleMsg = (event) => {
      if (event.data && event.data.type === 'LIVE_DATA_REFRESH') {
        fetchFooter();
        fetchServices();
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  return (
    <footer id="footer" style={{ position: 'relative' }}>
      <VisualEditorTrigger sectionPath="/admin/footer" />
      <div className="footer-grid">
        <div className="footer-brand">
          {renderLogo(footerData.logo)}
          <p>{footerData.brand_desc || 'A trusted Hijama & Cupping Therapy clinic providing authentic, certified, and compassionate healing services since 2012.'}</p>
          <div className="social-links">
            {footerData.facebook_link && (
              <a href={footerData.facebook_link} target="_blank" rel="noopener noreferrer" className="social-link" title="Facebook">
                {renderSocialIcon(footerData.facebook, <FacebookIcon size={20} />)}
              </a>
            )}
            {footerData.instagram_link && (
              <a href={footerData.instagram_link} target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
                {renderSocialIcon(footerData.instagram, <InstagramIcon size={20} />)}
              </a>
            )}
            {footerData.youtube_link && (
              <a href={footerData.youtube_link} target="_blank" rel="noopener noreferrer" className="social-link" title="YouTube">
                {renderSocialIcon(footerData.youtube, <YoutubeIcon size={20} />)}
              </a>
            )}
            {footerData.whatsapp_link && (
              <a href={footerData.whatsapp_link} target="_blank" rel="noopener noreferrer" className="social-link" title="WhatsApp">
                {renderSocialIcon(footerData.whatsapp, <LucideIcons.MessageCircle size={20} />)}
              </a>
            )}
          </div>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#services">Our Services</a></li>
            <li><a href="#doctors">Our Doctors</a></li>
            <li><a href="#benefits">Benefits</a></li>
            <li><a href="#testimonials">Patient Reviews</a></li>
            <li><a href="#contact">Book Appointment</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            {services.length > 0 ? services.map(srv => (
              <li key={srv.id}><a href="#services">{srv.name}</a></li>
            )) : (
              <>
                <li><a href="#services">Wet Cupping</a></li>
                <li><a href="#services">Dry Cupping</a></li>
                <li><a href="#services">Fire Cupping</a></li>
                <li><a href="#services">Massage Cupping</a></li>
                <li><a href="#services">Herbal Cupping</a></li>
                <li><a href="#services">Paediatric Care</a></li>
              </>
            )}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Information</h4>
          <ul>
            <li><a href="#">Hijama FAQ</a></li>
            <li><a href="#">Aftercare Guide</a></li>
            <li><a href="#">Sunnah Dates</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">
          {footerData.copyright || '© 2025 Al-Shifa Hijama Clinic. All rights reserved.'} 
          {!footerData.copyright && <span> Made with <LucideIcons.Heart size={12} style={{ display: 'inline', fill: '#ef4444', color: '#ef4444', verticalAlign: 'middle' }} /></span>}
        </div>
        <div className="footer-bottom-links">
          {footerData.privacy_link && <a href={footerData.privacy_link} target="_blank" rel="noopener noreferrer">{footerData.privacy || 'Privacy'}</a>}
          {footerData.terms_link && <a href={footerData.terms_link} target="_blank" rel="noopener noreferrer">{footerData.terms_ || 'Terms'}</a>}
          {footerData.site_maps_link && <a href={footerData.site_maps_link} target="_blank" rel="noopener noreferrer">{footerData.site_maps_ || 'Sitemap'}</a>}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

