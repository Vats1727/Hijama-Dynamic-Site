import React, { useState, useEffect } from 'react';
import { crudService } from '../../services/crud';
import * as LucideIcons from 'lucide-react';

const renderLogo = (logoValue) => {
  if (!logoValue) return <a href="#home" className="nav-logo">â˜½ Al-<span>Shifa</span></a>;
  if (logoValue.startsWith('upload/') || logoValue.startsWith('/upload/') || logoValue.startsWith('http')) {
    const src = logoValue.startsWith('upload/') ? `${import.meta.env.VITE_API_URL || '/server'}/${logoValue}` : (logoValue.startsWith('/upload/') ? `${import.meta.env.VITE_API_URL || '/server'}${logoValue}` : logoValue);
    return (
      <a href="#home" className="nav-logo">
        <img src={src} alt="Al-Shifa" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
      </a>
    );
  }
  return <a href="#home" className="nav-logo">{logoValue}</a>;
};

const renderSocialIcon = (nameOrEmoji, fallbackEmoji) => {
  if (!nameOrEmoji) return fallbackEmoji;

  // Check if it's a valid Lucide icon
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

  // Safe fallback to exact standard emojis or string
  const lower = nameOrEmoji.toLowerCase();
  if (lower.includes('fb') || lower.includes('face')) return 'ðŸ“˜';
  if (lower.includes('insta')) return 'ðŸ“¸';
  if (lower.includes('yt') || lower.includes('you')) return 'â–¶ï¸';
  if (lower.includes('wa') || lower.includes('what')) return 'ðŸ’¬';

  return nameOrEmoji || fallbackEmoji;
};

const Footer = () => {
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
    fetchFooter();
  }, []);

  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          {renderLogo(footerData.logo)}
          <p>{footerData.brand_desc || 'A trusted Hijama & Cupping Therapy clinic providing authentic, certified, and compassionate healing services since 2012.'}</p>
          <div className="social-links">
            {footerData.facebook_link && (
              <a href={footerData.facebook_link} target="_blank" rel="noopener noreferrer" className="social-link">
                {renderSocialIcon(footerData.facebook, 'ðŸ“˜')}
              </a>
            )}
            {footerData.instagram_link && (
              <a href={footerData.instagram_link} target="_blank" rel="noopener noreferrer" className="social-link">
                {renderSocialIcon(footerData.instagram, 'ðŸ“¸')}
              </a>
            )}
            {footerData.youtube_link && (
              <a href={footerData.youtube_link} target="_blank" rel="noopener noreferrer" className="social-link">
                {renderSocialIcon(footerData.youtube, 'â–¶ï¸')}
              </a>
            )}
            {footerData.whatsapp_link && (
              <a href={footerData.whatsapp_link} target="_blank" rel="noopener noreferrer" className="social-link">
                {renderSocialIcon(footerData.whatsapp, 'ðŸ’¬')}
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
            <li><a href="#services">Wet Cupping</a></li>
            <li><a href="#services">Dry Cupping</a></li>
            <li><a href="#services">Fire Cupping</a></li>
            <li><a href="#services">Massage Cupping</a></li>
            <li><a href="#services">Herbal Cupping</a></li>
            <li><a href="#services">Paediatric Care</a></li>
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
        <div className="footer-copy">{footerData.copyright || 'Â© 2025 Al-Shifa Hijama Clinic. All rights reserved. Made with ðŸ¤'}</div>
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

