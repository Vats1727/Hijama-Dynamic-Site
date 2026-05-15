import React, { useState, useEffect } from 'react';
import useNavbarScroll from '../../hooks/useNavbarScroll';
import { crudService } from '../../services/crud';
import { renderDynamicIcon } from '../../utils/IconRenderer';
import VisualEditorTrigger from '../VisualEditorTrigger';

const renderNavIcon = (iconName, fallbackEmoji) => {
  return <span className="logo-icon">{renderDynamicIcon(iconName, 24, fallbackEmoji)}</span>;
};

const renderHeading = (heading) => {
  if (!heading) return null;
  const parts = heading.split(' ');
  if (parts.length > 1) {
    const firstWord = parts[0];
    const remaining = parts.slice(1).join(' ');
    return <>{firstWord}<span>{remaining}</span></>;
  }
  return <>{heading}</>;
};

const Navbar = () => {
  const scrolled = useNavbarScroll();
  const [isOpen, setIsOpen] = useState(false);
  const [navData, setNavData] = useState({
    site_icon_: '',
    site_heading: '',
    book_now_button_: ''
  });

  useEffect(() => {
    const fetchNavData = async () => {
      try {
        const rows = await crudService.getAll('navigation_bar');
        const activeItem = (rows && Array.isArray(rows)) ? rows.find(item => item.status === 'Active') : null;
        if (activeItem) {
          setNavData({
            site_icon_: activeItem.site_icon_ || '',
            site_heading: activeItem.site_heading || '',
            book_now_button_: activeItem.book_now_button_ || ''
          });
        } else {
          setNavData({
            site_icon_: '',
            site_heading: '',
            book_now_button_: ''
          });
        }
      } catch (err) {
        console.error('Failed to load navigation bar data:', err);
        setNavData({
          site_icon_: '',
          site_heading: '',
          book_now_button_: ''
        });
      }
    };
    fetchNavData();
    
    const handleMsg = (event) => {
      if (event.data && event.data.type === 'LIVE_DATA_REFRESH') {
        fetchNavData();
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Doctors', href: '#doctors' },
    { name: 'Benefits', href: '#benefits' },
    { name: 'Reviews', href: '#testimonials' },
  ];

  let buttonLabel = '';
  let buttonUrl = '#contact';

  try {
    if (navData.book_now_button_) {
      if (typeof navData.book_now_button_ === 'object') {
        if (navData.book_now_button_.label) buttonLabel = navData.book_now_button_.label;
        if (navData.book_now_button_.url) buttonUrl = navData.book_now_button_.url;
      } else if (typeof navData.book_now_button_ === 'string') {
        const trimmed = navData.book_now_button_.trim();
        if (trimmed.startsWith('{')) {
          const parsed = JSON.parse(trimmed);
          if (parsed.label) buttonLabel = parsed.label;
          if (parsed.url) buttonUrl = parsed.url;
        } else {
          buttonLabel = navData.book_now_button_;
        }
      }
    }
  } catch (err) {
    console.error('Error parsing button json', err);
  }

  return (
    <>
      <nav id="navbar" className={scrolled ? 'scrolled' : ''} style={{ position: 'relative' }}>
        <VisualEditorTrigger sectionPath="/admin/navigation_bar" style={{ top: '75px', right: '20px' }} />
        <a href="#home" className="nav-logo">
          {renderNavIcon(navData.site_icon_, "☽")}
          {renderHeading(navData.site_heading) || <>Al-<span>Shifa</span></>}
        </a>
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a href={link.href}>{link.name}</a>
            </li>
          ))}
          {buttonLabel && (
            <li>
              <a href={buttonUrl} className="nav-cta">{buttonLabel}</a>
            </li>
          )}
        </ul>
        <div 
          className={`hamburger ${isOpen ? 'open' : ''}`} 
          id="hamburger" 
          onClick={toggleMenu}
        >
          <span></span><span></span><span></span>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`} id="mobileMenu">
        {navLinks.map((link) => (
          <a key={link.name} href={link.href} onClick={toggleMenu}>
            {link.name}
          </a>
        ))}
        {buttonLabel && (
          <a href={buttonUrl} onClick={toggleMenu}>{buttonLabel}</a>
        )}
      </div>
    </>
  );
};

export default Navbar;
