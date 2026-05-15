import './Admin.css';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [customWidth, setCustomWidth] = useState(100); // Width slider percentage
  const [customHeight, setCustomHeight] = useState(100); // Height slider percentage
  const iframeRef = React.useRef(null);

  const getSimulatorWidth = () => {
    if (previewMode === 'mobile') return '390px';
    if (previewMode === 'tablet') return '768px';
    return '100%';
  };

  const getSimulatorHeight = () => {
    if (previewMode === 'mobile') return '85%';
    if (previewMode === 'tablet') return '95%';
    return '100%';
  };

  const getScaleFactor = () => {
    return 1;
  };

  // Map paths to hash anchors for auto-scroll in preview
  const routeAnchorMap = {
    '/admin/about_section': '#about',
    '/admin/book_your_appointment': '#contact',
    '/admin/doctors_list': '#doctors',
    '/admin/doctors_section': '#doctors',
    '/admin/hero_section': '#home',
    '/admin/service_list': '#services',
    '/admin/services_section': '#services',
    '/admin/testimonial_section': '#testimonials',
    '/admin/testimonials_list': '#testimonials',
    '/admin/why_hijama': '#benefits',
    '/admin/footer': '#footer',
    '/admin/navigation_bar': '#home',
  };

  const getPreviewUrl = () => {
    const baseUrl = import.meta.env.VITE_ROUTER_BASE || '/';
    // Maintain static base preview URL so React never updates iframe node during section hops!
    return `${baseUrl}?admin_preview=true`;
  };

  // Intelligent Zero-Flicker Active Section Tracker ⚓️
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const anchor = routeAnchorMap[location.pathname] || '';
      try {
        // Instantly navigate the iframe scroll viewport using internal hash tracking without blanking the DOM!
        if (anchor) {
          iframeRef.current.contentWindow.location.hash = anchor;
        } else {
          iframeRef.current.contentWindow.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (err) {
        // Cross-origin fail-safe
      }
    }
  }, [location.pathname]);

  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const anchor = routeAnchorMap[location.pathname] || '';
      try {
        if (anchor) {
          iframeRef.current.contentWindow.location.hash = anchor;
        }
      } catch (err) {}
    }
  };

  const handleRefreshPreview = () => {
    setIframeKey(prev => prev + 1);
  };

  useEffect(() => {
    const handleApiUpdate = () => {
      // Trigger high-performance instant hot-reload directly inside iframe memory via postMessage!
      setTimeout(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage({ type: 'LIVE_DATA_REFRESH' }, '*');
          } catch (err) {
            // Hard origin fallback: refresh key
            setIframeKey(prev => prev + 1);
          }
        }
      }, 250); // Blazing-fast 250ms sync interval!
    };

    // Inter-Window Protocol: Direct Contextual Editor Trigger
    const handleWindowMessage = (event) => {
      if (event.data && event.data.type === 'OPEN_SECTION') {
        console.log('🚀 Contextual Link Clicked! Diverting customizer sidebar to:', event.data.section);
        navigate(event.data.section);
      }
    };

    window.addEventListener('api-data-updated', handleApiUpdate);
    window.addEventListener('message', handleWindowMessage);

    return () => {
      window.removeEventListener('api-data-updated', handleApiUpdate);
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [navigate]);

  useEffect(() => {
    const user = localStorage.getItem('admin_user');
    if (user) {
      setAdminUser(JSON.parse(user));
    }
    // Automatically collapse sidebar on small/medium desktop and tablet screens
    if (window.innerWidth <= 1200) {
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    // Automatically redirect the legacy main dashboard page to the first active editor section
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/navigation_bar'); 
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  const navItems = [
    { title: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
// [START_GENERATED_NAV_ITEMS]
    { title: 'Navigation Bar ', path: '/admin/navigation_bar', icon: 'Navigation' },
    { title: 'Hero Section', path: '/admin/hero_section', icon: 'Home' },
    { title: 'About Section', path: '/admin/about_section', icon: 'Album' },
    { title: 'Service List ', path: '/admin/service_list', icon: 'ClipboardList' },
    { title: 'Doctors List', path: '/admin/doctors_list', icon: 'Apple' },
    { title: 'Why Hijama ', path: '/admin/why_hijama', icon: 'ActivitySquare' },
    { title: 'Testimonials_List ', path: '/admin/testimonials_list', icon: 'TestTubeDiagonal' },
    { title: 'Contact Us', path: '/admin/book_your_appointment', icon: 'Sparkles' },
    { title: 'Incoming Inbox', path: '/admin/booked_appointments', icon: 'CalendarCheck' },
    { title: 'Footer', path: '/admin/footer', icon: 'Footprints' },
// [END_GENERATED_NAV_ITEMS]
  ];

  const currentPath = location.pathname;
  const currentItem = navItems.find(item => item.path === currentPath) || { title: 'Admin' };
  // Unified Customizer: Enforce mode-customizer layout globally to ensure the Live Preview is ALWAYS visible!
  const isEditing = true;
  const isWideApp = location.pathname === '/admin/booked_appointments';

  return (
    <div className="admin-container mode-customizer">
      {/* Sidebar Overlay for mobile viewports */}
      {isSidebarOpen && window.innerWidth <= 1024 && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* UNIFIED LIGHT-MODE CUSTOMIZER SIDEBAR (IMAGE 4 STYLE) */}
      <aside className={`admin-sidebar editing-active ${!isSidebarOpen ? 'collapsed-active' : ''}`}>
        {/* 1. LIGHT MODERN STUDIO HEADER */}
        <div className="modern-sidebar-header">
          <div className="admin-logo-box">
            <div className="logo-icon">
              <LucideIcons.ShieldCheck size={20} color="#6366f1" />
            </div>
            <span>Admin Studio</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            style={{
              background: '#f1f5f9', border: 'none', color: '#475569',
              width: '32px', height: '32px', borderRadius: '8px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={isSidebarOpen ? "Collapse Settings Sidebar" : "Expand Settings Sidebar"}
          >
            {isSidebarOpen ? <LucideIcons.PanelLeftClose size={18} /> : <LucideIcons.PanelLeftOpen size={18} />}
          </button>
        </div>

        {/* 2. HORIZONTAL SCROLLING SECTION CAROUSEL SELECTOR */}
        <div className="sections-horizontal-carousel">
          {navItems.filter(item => item.path !== '/admin').map((item, idx) => {
            const Icon = LucideIcons[item.icon] || LucideIcons.Circle;
            const isActive = location.pathname === item.path;
            // Clean up long names to keep the horizontal cards crisp!
            const displayTitle = item.title
              .replace('Section', '')
              .replace('List', '')
              .replace('Appointment', 'Book')
              .replace('Bar', '')
              .trim();

            return (
              <Link 
                key={idx} 
                to={item.path} 
                className={`carousel-card ${isActive ? 'active' : ''}`}
                title={item.title}
              >
                <div className="card-icon-container">
                  <Icon size={18} />
                </div>
                <span className="card-label">{displayTitle}</span>
                {isActive && <span className="active-dot-indicator" />}
              </Link>
            );
          })}
        </div>

        {/* 3. COMPACT DYNAMIC OUTLET DRAWER (THE EDITING FIELDS) */}
        <div className="sidebar-native-outlet-wrapper">
          {!isWideApp && <Outlet />}
          {isWideApp && (
            <div style={{ 
              padding: '40px 24px', textAlign: 'center', height: '100%', 
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              background: '#f8fafc'
            }}>
              <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '16px', borderRadius: '20px', marginBottom: '20px', display: 'flex' }}>
                <LucideIcons.CalendarCheck size={32} />
              </div>
              <h3 style={{ fontSize: '15px', color: '#0f172a', margin: '0 0 8px', fontWeight: '700' }}>Incoming Patient Inbox</h3>
              <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#64748b', margin: 0 }}>
                The live submissions table occupies the dynamic full-width desktop canvas on the right to provide comprehensive workspace space!
              </p>
            </div>
          )}
        </div>

        {/* 4. DYNAMIC SIDEBAR FOOTER */}
        <div className="modern-sidebar-footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="footer-action-link" title="View Live Public Site">
            <LucideIcons.Globe size={18} />
            <span className="footer-label">Live Public Site</span>
          </a>
          <button className="footer-action-btn" onClick={handleLogout} title="Sign Out of Admin">
            <LucideIcons.LogOut size={18} />
            <span className="footer-label">Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE: PERMANENTLY UTILITIES 100% RIGHT SPACE TO MOUNT LIVE PREVIEW CANVAS */}
      <main className="admin-main">
        {isWideApp ? (
          <div 
            style={{ 
              position: 'fixed',
              top: '0px',
              bottom: '0px',
              right: '0px',
              left: isSidebarOpen ? '380px' : '80px',
              width: isSidebarOpen ? 'calc(100vw - 380px)' : 'calc(100vw - 80px)',
              height: '100vh',
              zIndex: '10',
              background: '#f8fafc',
              overflowY: 'auto',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Outlet />
          </div>
        ) : (
          <section className="admin-content-container">
            <div 
              className="admin-preview-panel absolute-canvas"
              style={{ 
              // FIXED VIEWPORT ANCHOR: Forces the panel to lock directly to the window boundaries, completely bypassing intermediate DOM/CSS!
              position: 'fixed',
              top: '0px',
              bottom: '0px',
              right: '0px',
              left: isSidebarOpen ? '380px' : '80px',
              width: isSidebarOpen ? 'calc(100vw - 380px)' : 'calc(100vw - 80px)',
              height: '100vh',
              margin: '0px',
              padding: '0px',
              zIndex: '10', // Sits cleanly above base layout but below floating menus
              background: '#f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              justifyContent: 'stretch',
              boxSizing: 'border-box',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* FLOATING BROWSER SIMULATOR WITH DUAL-AXIS VIRTUAL AUTO-FIT */}
            <div 
              className={`browser-simulator-card mode-${previewMode}`}
              style={{ 
                width: previewMode === 'desktop' ? '100%' : getSimulatorWidth(),
                maxWidth: '100%',
                height: previewMode === 'desktop' ? '100%' : getSimulatorHeight(),
                maxHeight: '100%',
                // IMPERVIOUS SPATIAL SYSTEM: Full edge-to-edge absolute bounds for Desktop, centered float for Mobile/Tablet
                position: 'absolute',
                top: previewMode === 'desktop' ? '0px' : '50%',
                left: previewMode === 'desktop' ? '0px' : '50%',
                transform: previewMode === 'desktop' ? 'none' : 'translate(-50%, -50%)',
                margin: '0px',
                padding: '0px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                // DYNAMIC VISUAL MORPH: Edge-to-Edge for Desktop, Curved Floating Card for Mobile/Tablet!
                borderRadius: previewMode === 'desktop' ? '0px' : '16px',
                boxShadow: previewMode === 'desktop' ? 'none' : '0 20px 50px rgba(0,0,0,0.08)',
                border: previewMode === 'desktop' ? 'none' : '1px solid #cbd5e1',
                borderLeft: '1px solid #e2e8f0' // Fine-line separator
              }}
            >
              <div className="preview-header">
                <div className="preview-status">
                  <span className="status-dot pulsing"></span> Live Preview
                </div>

                {/* DEVICE QUICK-TOGGLE CONTROLS */}
                <div className="preview-device-controls">
                  <div className="device-btn-group">
                    <button 
                      className={`device-toggle-btn ${previewMode === 'mobile' ? 'active' : ''}`} 
                      onClick={() => setPreviewMode('mobile')}
                      title="Mobile Preset View"
                    >
                      <LucideIcons.Smartphone size={14} />
                    </button>
                    <button 
                      className={`device-toggle-btn ${previewMode === 'tablet' ? 'active' : ''}`} 
                      onClick={() => setPreviewMode('tablet')}
                      title="Tablet Preset View"
                    >
                      <LucideIcons.Tablet size={14} />
                    </button>
                    <button 
                      className={`device-toggle-btn ${previewMode === 'desktop' ? 'active' : ''}`} 
                      onClick={() => setPreviewMode('desktop')}
                      title="Custom Scaling Mode"
                    >
                      <LucideIcons.Monitor size={14} />
                    </button>
                  </div>


                </div>

                <button className="refresh-preview-btn" onClick={handleRefreshPreview} title="Refresh Page Context">
                  <LucideIcons.RotateCw size={14} />
                </button>
              </div>
              
              <iframe 
                key={iframeKey}
                src={getPreviewUrl()} 
                className="admin-preview-iframe"
                ref={iframeRef}
                onLoad={handleIframeLoad}
                title="Live Customizer Preview"
              />
            </div>
          </div>
        </section>
        )}
      </main>

      <style>{`
        /* ===== ULTRA-WIDE SPLIT SCREEN DESKTOP CANVAS OVERRIDES ===== */
        
        /* ===== IN-SIDEBAR FLEXIBLE TOOLCANVAS OVERRIDES ===== */
        
        /* Flat breakout overlay to cover the full screen cleanly */
        .admin-container.mode-customizer {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          z-index: 99999 !important;
          overflow: hidden !important;
          background: #f1f5f9 !important;
          display: flex !important;
        }

        /* Single Dynamic Unified Sidebar Configuration: Locked at 380px Light Studio Theme */
        .admin-sidebar.editing-active {
          flex: 0 0 380px !important;
          width: 380px !important;
          min-width: 380px !important;
          max-width: 380px !important;
          background: #ffffff !important; /* Pure elegant light white */
          border-right: 1px solid #e2e8f0 !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          display: flex !important;
          flex-direction: column !important;
          height: 100vh !important;
          overflow: hidden !important;
          box-shadow: 4px 0 24px rgba(0,0,0,0.015) !important;
          opacity: 1 !important;
        }

        /* Collapsed Active Sidebar Configuration */
        .admin-sidebar.editing-active.collapsed-active {
          flex: 0 0 80px !important;
          width: 80px !important;
          min-width: 80px !important;
          max-width: 80px !important;
          border-right: 1px solid #e2e8f0 !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }

        .admin-sidebar.editing-active.collapsed-active .modern-sidebar-header {
          padding: 14px 0 !important;
          justify-content: center !important;
          flex-direction: column !important;
        }
        .admin-sidebar.editing-active.collapsed-active .admin-logo-box span {
          display: none !important;
        }
        .admin-sidebar.editing-active.collapsed-active .sidebar-native-outlet-wrapper {
          display: none !important;
        }
        .admin-sidebar.editing-active.collapsed-active .sections-horizontal-carousel {
          flex-direction: column !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          padding: 16px 0 !important;
          gap: 16px !important;
          align-items: center !important;
          background: #ffffff !important;
          border-bottom: none !important;
          height: 100% !important;
        }
        .admin-sidebar.editing-active.collapsed-active .carousel-card {
          width: 44px !important;
          height: 44px !important;
          min-width: 44px !important;
          flex-shrink: 0 !important;
          padding: 0 !important;
          justify-content: center !important;
          border-radius: 12px !important;
        }
        .admin-sidebar.editing-active.collapsed-active .card-label,
        .admin-sidebar.editing-active.collapsed-active .active-dot-indicator {
          display: none !important;
        }

        .sidebar-content-wrapper {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          min-height: 0 !important;
          overflow: hidden !important;
        }

        /* Top Bar with Logo + Logout */
        .modern-sidebar-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 14px 20px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          background: #ffffff !important;
          flex-shrink: 0 !important;
        }
        .modern-sidebar-header .admin-logo-box {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .modern-sidebar-header .admin-logo-box span {
          font-weight: 800 !important;
          font-size: 15px !important;
          color: #0f172a !important;
          letter-spacing: -0.3px !important;
        }
        .modern-sidebar-footer {
          margin-top: auto !important;
          border-top: 1px solid #e2e8f0 !important;
          padding: 16px 20px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
          background: #ffffff !important;
          flex-shrink: 0 !important;
        }
        .footer-action-btn, .footer-action-link {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          background: transparent !important;
          border: none !important;
          color: #64748b !important;
          cursor: pointer !important;
          padding: 10px 12px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          text-decoration: none !important;
          transition: all 0.2s !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .footer-action-link:hover {
          background: #eff6ff !important;
          color: #3b82f6 !important;
        }
        .footer-action-btn:hover {
          background: #fef2f2 !important;
          color: #ef4444 !important;
        }

        /* Collapsed logic for footer */
        .admin-sidebar.editing-active.collapsed-active .modern-sidebar-footer {
          padding: 16px 0 !important;
          align-items: center !important;
        }
        .admin-sidebar.editing-active.collapsed-active .footer-label {
          display: none !important;
        }
        .admin-sidebar.editing-active.collapsed-active .footer-action-btn,
        .admin-sidebar.editing-active.collapsed-active .footer-action-link {
          justify-content: center !important;
          padding: 10px !important;
          width: 44px !important;
          height: 44px !important;
          gap: 0 !important;
        }

        /* The Gorgeous Horizontal Section Carousel (Image 4 Style) */
        .sections-horizontal-carousel {
          display: flex !important;
          overflow-x: auto !important;
          gap: 12px !important;
          padding: 16px 20px 12px 20px !important; /* Slightly reduced bottom padding to balance visual scrollbar spacing */
          background: #f8fafc !important; /* Light frame for the cards */
          border-bottom: 1px solid #e2e8f0 !important;
          flex-shrink: 0 !important;
          
          /* Enable visual thin scrollbar for Firefox */
          scrollbar-width: thin !important;
          scrollbar-color: #cbd5e1 transparent !important;
        }

        /* Sleek Webkit Custom Scrollbar for Horizontal Navigation */
        .sections-horizontal-carousel::-webkit-scrollbar {
          height: 5px !important; /* Ultra sleek thin height */
          display: block !important; /* Make it explicit! */
        }
        .sections-horizontal-carousel::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.01) !important;
          border-radius: 10px !important;
        }
        .sections-horizontal-carousel::-webkit-scrollbar-thumb {
          background: #cbd5e1 !important;
          border-radius: 10px !important;
          transition: background 0.2s ease !important;
        }
        .sections-horizontal-carousel::-webkit-scrollbar-thumb:hover {
          background: #94a3b8 !important; /* Subtle visual cue on hover */
        }

        .carousel-card {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 6px !important;
          text-decoration: none !important;
          color: #64748b !important;
          flex-shrink: 0 !important;
          width: 62px !important;
          transition: all 0.2s ease-in-out !important;
          position: relative !important;
        }
        .card-icon-container {
          width: 42px !important;
          height: 42px !important;
          border-radius: 12px !important;
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.01) !important;
          color: #64748b !important;
        }
        .card-label {
          font-size: 10px !important;
          font-weight: 700 !important;
          text-align: center !important;
          max-width: 100% !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          text-transform: capitalize !important;
          letter-spacing: 0.2px !important;
        }

        .carousel-card:hover .card-icon-container {
          border-color: #cbd5e1 !important;
          color: #0f172a !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px rgba(0,0,0,0.04) !important;
        }
        .carousel-card:hover .card-label {
          color: #0f172a !important;
        }

        .carousel-card.active .card-icon-container {
          background: #4f46e5 !important; /* High contrast active pill */
          border-color: #4f46e5 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3) !important;
        }
        .carousel-card.active .card-label {
          color: #4f46e5 !important;
          font-weight: 800 !important;
        }
        .active-dot-indicator {
          position: absolute !important;
          bottom: -10px !important;
          width: 5px !important;
          height: 5px !important;
          background: #4f46e5 !important;
          border-radius: 50% !important;
        }

        /* 🚨 THE NATIVE DRAWER RENDERER (WHERE FORMS LIVE INSIDE SIDEBAR) 🚨 */
        .sidebar-native-outlet-wrapper,
        .sidebar-native-outlet-wrapper * {
          box-sizing: border-box !important; /* FORCES exact pixel width control everywhere! */
        }
        .sidebar-native-outlet-wrapper {
          background: #f8fafc !important; /* Pure original workspace color! */
          flex: 1 !important;
          padding: 16px 16px 32px 16px !important; /* Tighter top and side padding to pull content up! */
          overflow-y: auto !important;
          min-height: 0 !important;
        }
        
        /* Scrollbar styling for the native drawer */
        .sidebar-native-outlet-wrapper::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-native-outlet-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .sidebar-native-outlet-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        /* ===== HIGHLY OPTIMIZED COMPACT VIEW INSIDE DRAWER ===== */
        
        /* Adapt admin cards so they fit the layout inside the sidebar drawer perfectly without changing design */
        .sidebar-native-outlet-wrapper .admin-card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          padding: 16px !important; /* Reduced from 24px/32px */
          margin-bottom: 16px !important; /* Tighten bottom card gaps */
        }

        /* Reduce redundant inner header padding and title sizing */
        .sidebar-native-outlet-wrapper .admin-section-header,
        .sidebar-native-outlet-wrapper .admin-card-header {
          margin-bottom: 12px !important;
          margin-top: 0px !important; /* Wipe top margin gaps! */
          padding-top: 0px !important;
        }
        
        /* Globally reduce section titles and remove redundant subtitles per user requests */
        .sidebar-native-outlet-wrapper .admin-section-header h2,
        .sidebar-native-outlet-wrapper .admin-card-title {
          font-size: 17px !important; /* Decreased section title font size */
          font-weight: 850 !important;
          margin-bottom: 0px !important;
          margin-top: 0px !important;
          letter-spacing: -0.4px !important;
        }
        
        /* Hide all descriptive subtitles in customizer sidebar drawer completely! */
        .sidebar-native-outlet-wrapper .admin-section-header p,
        .sidebar-native-outlet-wrapper .admin-card-subtitle {
          display: none !important;
        }
        
        /* Ensure generic sub-header nodes behave nicely */
        .sidebar-native-outlet-wrapper .admin-card-header h3 {
          font-size: 14px !important;
        }

        /* Compact primary and secondary buttons */
        .sidebar-native-outlet-wrapper .admin-btn {
          padding: 8px 14px !important; /* Sleeker clickables */
          font-size: 12px !important;
          min-height: unset !important;
          height: auto !important;
          gap: 6px !important;
          border-radius: 6px !important;
        }
        
        /* Compact Data Table Layout Overrides */
        .sidebar-native-outlet-wrapper .admin-table-wrap {
          box-shadow: none !important;
          border: 1px solid #e2e8f0 !important;
          margin-top: 8px !important;
          border-radius: 8px !important;
        }
        .sidebar-native-outlet-wrapper table.admin-table {
          width: 100% !important;
          table-layout: fixed !important; /* FORCES container boundary constraint, ZERO scroll! */
          font-size: 12px !important; /* Highly dense professional readable text */
        }
        .sidebar-native-outlet-wrapper table.admin-table th {
          padding: 8px 10px !important;
          font-size: 10px !important;
          background: #f8fafc !important;
          letter-spacing: 0.5px !important;
          font-weight: 750 !important;
          color: #64748b !important;
          text-transform: uppercase !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        .sidebar-native-outlet-wrapper table.admin-table td {
          padding: 8px 10px !important; /* Compact density */
          vertical-align: middle !important;
          height: auto !important;
          line-height: 1.3 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important; /* Truncates long text beautifully! */
          white-space: nowrap !important;
        }
        
        /* Set precise, dynamic cell bounds inside the fixed-table grid drawer */
        .sidebar-native-outlet-wrapper table.admin-table th:first-child,
        .sidebar-native-outlet-wrapper table.admin-table td:first-child {
          width: 36px !important; /* Compact row ID */
        }
        .sidebar-native-outlet-wrapper table.admin-table th:last-child,
        .sidebar-native-outlet-wrapper table.admin-table td:last-child {
          width: 85px !important; /* Fixed Actions width to ensure button alignments */
          text-align: right !important;
        }
        
        /* UNCONGEST TABLE LAYOUTS: Truncate middle columns to show ONLY first 3 core fields + actions! */
        .sidebar-native-outlet-wrapper table.admin-table th:nth-child(n+5):not(:last-child),
        .sidebar-native-outlet-wrapper table.admin-table td:nth-child(n+5):not(:last-child) {
          display: none !important;
        }
        
        /* Responsive compacting for standard assets like image thumbnails and icons inside cells */
        .sidebar-native-outlet-wrapper table.admin-table img {
          width: 36px !important;
          height: 36px !important;
          border-radius: 4px !important;
          object-fit: cover !important;
        }
        
        /* Compact Action Grid Drawer */
        .sidebar-native-outlet-wrapper .admin-actions {
          gap: 4px !important;
        }
        .sidebar-native-outlet-wrapper .admin-action-btn {
          width: 28px !important;
          height: 28px !important;
          font-size: 12px !important;
          padding: 0 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 6px !important;
        }
        .sidebar-native-outlet-wrapper .admin-action-btn svg {
          width: 14px !important;
          height: 14px !important;
        }
        
        /* ===== BULLETPROOF INPUT OVERRIDES (NO HORIZON BLEED FIX) ===== */
        
        /* Collapse wide forms grid to vertical stack in tight drawer */
        .sidebar-native-outlet-wrapper .admin-form-grid {
          grid-template-columns: 1fr !important; 
          gap: 12px !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        
        .sidebar-native-outlet-wrapper .admin-form-group {
          margin-bottom: 12px !important; /* Tighten input clusters */
          width: 100% !important;
          max-width: 100% !important;
        }

        /* Force rigid width limits on all fields, selectors, and uploaders */
        .sidebar-native-outlet-wrapper .admin-input,
        .sidebar-native-outlet-wrapper .admin-textarea,
        .sidebar-native-outlet-wrapper input:not([type="color"]):not([type="checkbox"]):not([type="radio"]),
        .sidebar-native-outlet-wrapper textarea,
        .sidebar-native-outlet-wrapper select,
        .sidebar-native-outlet-wrapper .icon-selector-premium,
        .sidebar-native-outlet-wrapper .icon-current,
        .sidebar-native-outlet-wrapper .input-wrapper-premium,
        .sidebar-native-outlet-wrapper .image-upload-box-premium,
        .sidebar-native-outlet-wrapper .text-repeater,
        .sidebar-native-outlet-wrapper .repeater-item {
          width: 100% !important;
          max-width: 100% !important;
        }

        /* Native Swatch Restoration for Background Color Pickers */
        .sidebar-native-outlet-wrapper input[type="color"] {
          width: 50px !important;
          min-width: 50px !important;
          max-width: 50px !important;
          height: 42px !important;
          min-height: 42px !important;
          padding: 2px !important;
          background: #ffffff !important;
          cursor: pointer !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 6px !important;
        }

        .sidebar-native-outlet-wrapper .admin-label {
          font-size: 12px !important;
          margin-bottom: 4px !important;
          font-weight: 600 !important;
          color: #475569 !important;
        }

        .sidebar-native-outlet-wrapper .admin-input,
        .sidebar-native-outlet-wrapper .admin-textarea,
        .sidebar-native-outlet-wrapper input:not([type="color"]):not([type="checkbox"]):not([type="radio"]),
        .sidebar-native-outlet-wrapper textarea,
        .sidebar-native-outlet-wrapper select {
          padding: 8px 12px !important; /* Sleek, highly usable height */
          font-size: 13px !important;
          min-height: 38px !important;
          height: auto !important;
          border-radius: 6px !important;
        }
        
        /* GLOBAL SEARCH BAR OVERLAP FIX: Secure absolute positioning for Lucide icons inside search inputs */
        .sidebar-native-outlet-wrapper .admin-search-box-premium {
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
        }
        .sidebar-native-outlet-wrapper .admin-search-box-premium svg {
          position: absolute !important;
          left: 14px !important;
          color: #64748b !important;
          pointer-events: none !important;
          z-index: 10 !important;
          transition: color 0.2s !important;
        }
        /* SPECIFICITY CHAMPION: Force absolute precedence over global inputs by duplicating target pseudo-classes */
        .sidebar-native-outlet-wrapper .admin-search-box-premium input.admin-input,
        .sidebar-native-outlet-wrapper .admin-search-box-premium input:not([type="color"]):not([type="checkbox"]):not([type="radio"]) {
          padding-left: 42px !important; /* Superior mathematically-calculated 42px buffer zones! */
          width: 100% !important;
        }
        .sidebar-native-outlet-wrapper .admin-search-box-premium:focus-within svg {
          color: #4f46e5 !important; /* Smooth indigo glow on focus! */
        }
        
        /* Restrict huge textareas to prevent endless scrolling inside forms */
        .sidebar-native-outlet-wrapper .admin-textarea,
        .sidebar-native-outlet-wrapper textarea {
          min-height: 80px !important; 
          max-height: 140px !important;
          resize: vertical !important;
        }

        /* --- 💎 ICON SELECTOR & LUCIDE VISIBILITY FIXES 💎 --- */
        
        /* Explicit visibility for current selection icon indicator */
        .sidebar-native-outlet-wrapper .icon-current svg {
          stroke: #334155 !important; /* Slate high-contrast */
          stroke-width: 2px !important;
          display: inline-block !important;
          vertical-align: middle !important;
          margin-right: 10px !important;
          flex-shrink: 0 !important;
        }

        /* Icon Drawer Search Bar Overhaul for contrast */
        .sidebar-native-outlet-wrapper .icon-search-bar {
          background: #f8fafc !important;
          border: 1.5px solid #cbd5e1 !important; /* Clearly defined edges */
          border-radius: 8px !important;
          padding: 4px 12px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.03) !important;
          width: 100% !important;
        }
        .sidebar-native-outlet-wrapper .icon-search-bar svg {
          stroke: #64748b !important;
          stroke-width: 2px !important;
          flex-shrink: 0 !important;
        }
        .sidebar-native-outlet-wrapper .icon-search-bar input {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 6px 4px !important;
          min-height: unset !important; /* Revert global 38px min-height */
          height: 28px !important;
          color: #0f172a !important; /* Rich dark text */
          font-size: 13px !important;
          outline: none !important;
          width: 100% !important;
        }
        .sidebar-native-outlet-wrapper .icon-search-bar input::placeholder {
          color: #94a3b8 !important; /* Soft grey placeholder */
          opacity: 1 !important;
        }
        
        /* Scale the icon dropdown so it NEVER overflows the sidebar drawer */
        .sidebar-native-outlet-wrapper .icon-dropdown-grid {
          width: 100% !important;
          min-width: 100% !important;
          max-width: 100% !important;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08) !important;
          border-color: #e2e8f0 !important;
          background: #ffffff !important;
          left: 0 !important;
        }

        /* Fix Lucide icon rendering inside white list items */
        .sidebar-native-outlet-wrapper .icon-grid-item {
          color: #334155 !important; /* High-contrast slate for perfect light mode readability */
          font-weight: 500 !important;
          font-size: 11px !important;
          border-color: #f1f5f9 !important;
        }
        
        /* Explicit SVG stroke validation to make icons pop out! */
        .sidebar-native-outlet-wrapper .icon-grid-item svg {
          stroke: #475569 !important; /* Force visible grey-indigo path strokes */
          stroke-width: 2px !important;
          display: block !important;
          flex-shrink: 0 !important;
        }
        
        .sidebar-native-outlet-wrapper .icon-grid-item:hover {
          background: #f5f3ff !important;
          color: #4f46e5 !important;
        }
        .sidebar-native-outlet-wrapper .icon-grid-item:hover svg {
          stroke: #4f46e5 !important;
        }

        .sidebar-native-outlet-wrapper .icon-grid-item.active {
          background: #4f46e5 !important;
          color: #ffffff !important;
        }
        .sidebar-native-outlet-wrapper .icon-grid-item.active svg {
          stroke: #ffffff !important;
        }

        /* Condense grid items per row to avoid overcrowding in narrow container */
        .sidebar-native-outlet-wrapper .icon-grid-scroll {
          grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)) !important;
          gap: 6px !important;
        }
        
        /* Tighten the footer form buttons drawer */
        .sidebar-native-outlet-wrapper .admin-form-actions {
          margin-top: 16px !important;
          padding-top: 16px !important;
          gap: 8px !important;
          display: flex !important;
          justify-content: flex-end !important;
        }

        /* ===== CRITICAL CARD GRID & INFO CARD OVERFLOW REDUCTION (NO HORIZON BLEED) ===== */
        
        /* Disable horizontal overflow completely for the side customizer drawer */
        .sidebar-native-outlet-wrapper {
          overflow-x: hidden !important;
        }

        /* Force 1-column layout in card grid regardless of screen size to contain it in the 380px sidebar */
        .sidebar-native-outlet-wrapper .admin-vertical-card-grid {
          grid-template-columns: 1fr !important;
          width: 100% !important;
          max-width: 100% !important;
          gap: 16px !important;
          margin-top: 12px !important;
          box-sizing: border-box !important;
        }

        /* Ensure cards fit flush against parent box limits */
        .sidebar-native-outlet-wrapper .admin-info-card {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          margin: 0 0 16px 0 !important;
        }

        /* Optimize card internal row padding and layout to fit the compact 380px workspace */
        .sidebar-native-outlet-wrapper .admin-info-row {
          padding: 10px 14px !important; /* Even tighter internal row padding */
          min-height: unset !important;
          height: auto !important;
          gap: 6px !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 0 4px 0 !important; /* Clean up dangerous negative margins on doctors header block! */
          box-sizing: border-box !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
        }
        
        /* Enforce specific metric grid fitments on profile metric slots */
        .sidebar-native-outlet-wrapper .admin-info-row div[style*="grid-template-columns"],
        .sidebar-native-outlet-wrapper .admin-info-row div[style*="gridTemplateColumns"] {
          gap: 4px !important;
        }
        .sidebar-native-outlet-wrapper .admin-info-row div[style*="grid-template-columns"] div,
        .sidebar-native-outlet-wrapper .admin-info-row div[style*="gridTemplateColumns"] div {
          font-size: 11px !important; /* Shrink stat titles & counts so they do not wrap! */
        }
        
        /* Compact labels inside cards */
        .sidebar-native-outlet-wrapper .admin-info-label {
          font-size: 10px !important;
          margin-right: 6px !important;
        }
 
        /* Allow values to wrap and contain themselves perfectly without overlapping horizontally! */
        .sidebar-native-outlet-wrapper .admin-info-value {
          font-size: 12px !important;
          max-width: 72% !important; /* Solid outer bounds limit */
          display: flex !important;
          align-items: center !important; /* Retain right-side visual alignment */
          justify-content: flex-end !important;
          text-align: right !important;
          min-width: 0 !important;
          word-wrap: break-word !important;
          word-break: break-word !important;
        }
        
        
        /* Ensure inline image previews and icons maintain proportions in tight slots */
        .sidebar-native-outlet-wrapper .admin-card-thumb {
          width: 36px !important;
          height: 36px !important;
          flex-shrink: 0 !important;
        }
        .sidebar-native-outlet-wrapper .admin-card-icon-box {
          width: 32px !important;
          height: 32px !important;
          flex-shrink: 0 !important;
        }
        .sidebar-native-outlet-wrapper .admin-info-row img {
          max-height: 50px !important;
          object-fit: contain !important;
        }
        
        /* Keep nested block summaries fully fluid */
        .sidebar-native-outlet-wrapper .admin-info-row > div {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        /* Expand main content workspace to sit next to the expanded sidebar */
        .admin-container.mode-customizer .admin-main {
          margin-left: 380px !important; /* Aligns exactly to narrowed sidebar */
          width: calc(100vw - 380px) !important;
          transition: margin-left 0.3s ease;
          height: 100vh !important;
          max-height: 100vh !important;
          min-height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
          background: #f1f5f9 !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }

        .admin-container.mode-customizer .admin-content-container {
          height: 100% !important; /* STRICT BOUNDS: Scale relative to locked 100vh parent workspace */
          max-height: 100% !important; 
          min-height: 0 !important;
          flex: 1 !important;
          width: 100% !important;
          display: flex !important;
          background: #ffffff !important; /* Matches native white content backgrounds */
          overflow: hidden !important; /* STRUCTURAL LOCK: Absolutely block content overflow stretch */
          box-sizing: border-box !important;
        }

        /* Center the floating browser card cleanly inside the available viewport space */
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas {
          flex: 1 !important;
          height: 100% !important; /* STRICT BOUNDS: Stay relative to content container */
          max-height: 100% !important;
          min-height: 0 !important;
          padding: 0px !important; /* ZERO PADDING: Eliminates outer gray gaps requested by user! */
          background: #f1f5f9 !important; /* Soft professional background */
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important; /* CRITICAL: Centers box horizontally */
          justify-content: center !important; /* CRITICAL: Centers box vertically to eliminate top gap! */
          box-sizing: border-box !important; /* HARD-CODED FIX: Ensure padding does not expand total height! */
          overflow: hidden !important;
        }

        /* FLOATING SIMULATOR BOX: Seamless edge-to-edge integrated frame configuration */
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card {
          width: 100%; /* Dynamic React Width support */
          max-width: 150% !important; /* Raise limit to accommodate 150% dynamic scaling */
          height: 100%; /* Dynamic React Height support */
          max-height: 150% !important; /* Raise limit to accommodate 150% dynamic scaling */
          min-height: 0 !important;
          background: #ffffff !important;
          border-radius: 0px !important; /* STRIPPED ROUNDING: Fills corners edge-to-edge perfectly */
          box-shadow: none !important; /* STRIPPED SHADOW: Seamless integration into the frame */
          border: none !important; /* STRIPPED BORDER: Sit flush with boundaries */
          border-left: 1px solid #e2e8f0 !important; /* Fine line separator against the sidebar */
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important; /* Clips iframe contents */
          flex-shrink: 0 !important;
          box-sizing: border-box !important;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important; /* Smooth, fully synchronized 3D morphing transitions */
        }

        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .preview-header {
          background: #ffffff !important;
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          border-radius: 0 !important; /* Inherits outer rounding from card parent */
          padding: 8px 16px !important; /* Condense to recover extra vertical viewport for the iframe! */
          color: #1e293b !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          z-index: 10 !important;
          flex-shrink: 0;
        }

        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .preview-status {
          color: #334155 !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .status-dot {
          width: 8px; height: 8px;
          background: #10b981;
          border-radius: 50%;
        }

        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .refresh-preview-btn {
          background: #f1f5f9 !important;
          border: 1px solid #e2e8f0 !important;
          color: #64748b !important;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          transition: 0.2s;
        }
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .refresh-preview-btn:hover {
          background: #e2e8f0 !important;
          color: #0f172a !important;
        }

        /* PREMIUM DYNAMIC DEVICE EMULATOR CONTROLS STYLES */
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .preview-device-controls {
          display: flex !important;
          align-items: center !important;
          gap: 16px !important;
          flex-shrink: 0 !important;
        }
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .device-btn-group {
          display: flex !important;
          background: #f1f5f9 !important;
          border-radius: 8px !important;
          padding: 2px !important;
          border: 1px solid #e2e8f0 !important;
        }
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .device-toggle-btn {
          background: transparent !important;
          border: none !important;
          color: #64748b !important;
          cursor: pointer !important;
          padding: 5px 9px !important;
          border-radius: 6px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
        }
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .device-toggle-btn:hover {
          color: #0f172a !important;
          background: #e2e8f0 !important;
        }
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .device-toggle-btn.active {
          background: #ffffff !important;
          color: #4f46e5 !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
        }
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .dimension-sliders-wrapper {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
        }
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .slider-adjustment-panel {
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
        }
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .dimension-axis-tag {
          font-size: 10px !important;
          font-weight: 800 !important;
          color: #94a3b8 !important;
          background: #f1f5f9 !important;
          border-radius: 3px !important;
          padding: 1px 4px !important;
          border: 1px solid #e2e8f0 !important;
        }
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .dimension-slider {
          -webkit-appearance: none !important;
          appearance: none !important;
          width: 75px !important;
          height: 4px !important;
          border-radius: 2px !important;
          background: #cbd5e1 !important;
          outline: none !important;
          cursor: pointer !important;
        }
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .dimension-slider::-webkit-slider-thumb {
          -webkit-appearance: none !important;
          appearance: none !important;
          width: 12px !important;
          height: 12px !important;
          border-radius: 50% !important;
          background: #6366f1 !important;
          cursor: pointer !important;
          box-shadow: 0 2px 4px rgba(99, 102, 241, 0.4) !important;
          transition: transform 0.1s ease !important;
        }
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .dimension-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2) !important;
        }
        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .dimension-badge {
          font-size: 10px !important;
          font-weight: 700 !important;
          color: #334155 !important;
          background: #e2e8f0 !important;
          padding: 2px 5px !important;
          border-radius: 4px !important;
          min-width: 28px !important;
          text-align: center !important;
        }

        .admin-container.mode-customizer .admin-preview-panel.absolute-canvas .browser-simulator-card .admin-preview-iframe {
          flex: 1 !important;
          height: 0 !important; /* CRITICAL: Disregard content height & lock strictly to remaining flex container space! */
          min-height: 0 !important;
          border: none !important; 
          border-radius: 0 !important;
          background: #ffffff !important;
          box-shadow: none !important;
          width: 100% !important;
          display: block !important;
        }

        @media (max-width: 1024px) {
          .admin-sidebar.editing-active {
            width: 100% !important;
            max-width: 100% !important;
            position: fixed !important;
            top: 0; left: 0; z-index: 1000;
          }
        }

        .admin-container { 
          display: flex; 
          width: 100vw; 
          max-width: 100%; 
          margin: 0; 
          text-align: left; 
          min-height: 100vh; 
          background: #f1f5f9; 
          font-family: 'Inter', sans-serif; 
          box-sizing: border-box; 
        }
        .admin-sidebar { 
          width: 260px; 
          background: #0f172a; 
          color: white; 
          display: flex; 
          flex-direction: column; 
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          position: fixed; 
          top: 0; 
          bottom: 0; 
          left: 0; 
          z-index: 50; 
          box-shadow: 10px 0 30px rgba(0,0,0,0.1);
        }
        .admin-sidebar.closed { 
          width: 80px; 
        }
        .sidebar-header { 
          padding: 24px 20px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          height: 72px; 
        }
        .admin-logo-box { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          font-weight: 800; 
          font-size: 16px; 
          overflow: hidden; 
          white-space: nowrap; 
        }
        .logo-icon { 
          width: 40px; 
          height: 40px; 
          background: rgba(99, 102, 241, 0.1); 
          border-radius: 10px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
        }
        .sidebar-toggle-btn { 
          background: rgba(255,255,255,0.05); 
          border: none; 
          color: #94a3b8; 
          cursor: pointer; 
          display: flex; 
          padding: 6px; 
          border-radius: 8px; 
          transition: 0.2s; 
        }
        .sidebar-toggle-btn:hover { 
          background: rgba(255,255,255,0.1); 
          color: white; 
        }
        
        .sidebar-nav { 
          flex: 1; 
          padding: 12px; 
          display: flex; 
          flex-direction: column; 
          gap: 4px; 
          overflow-y: auto; 
        }
        .nav-item { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 12px 16px; 
          border-radius: 10px; 
          text-decoration: none; 
          color: #94a3b8; 
          transition: all 0.2s ease; 
          font-weight: 600; 
          font-size: 14px;
        }
        .nav-item:hover { 
          background: rgba(255,255,255,0.05); 
          color: #f8fafc; 
        }
        .nav-item.active { 
          background: #6366f1; 
          color: white; 
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); 
        }
        .admin-sidebar.closed .nav-item { 
          padding: 12px; 
          justify-content: center; 
        }
        .admin-sidebar.closed .nav-item span { 
          display: none; 
        }
        
        .sidebar-footer { 
          padding: 12px; 
          border-top: 1px solid rgba(255,255,255,0.05); 
        }
        .logout-btn { 
          width: 100%; 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 12px 16px; 
          border-radius: 10px; 
          background: transparent; 
          color: #f87171; 
          border: none; 
          cursor: pointer; 
          font-weight: 700; 
          transition: 0.2s;
        }
        .logout-btn:hover { 
          background: rgba(239, 68, 68, 0.1); 
        }
        .admin-sidebar.closed .logout-btn { 
          padding: 12px; 
          justify-content: center; 
        }
        
        .admin-main { 
          flex: 1; 
          margin-left: 260px; 
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          min-width: 0; 
        }
        .admin-sidebar.closed + .admin-main { 
          margin-left: 80px; 
        }
        
        .admin-header { 
          height: 72px; 
          background: white; 
          border-bottom: 1px solid #e2e8f0; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 0 32px; 
          position: sticky; 
          top: 0; 
          z-index: 40; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .header-left { 
          display: flex; 
          align-items: center; 
          gap: 24px; 
        }
        .menu-toggle { 
          display: none; 
          background: none; 
          border: none; 
          cursor: pointer; 
          color: #0f172a; 
        }
        .header-breadcrumb { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          font-size: 14px; 
          font-weight: 600; 
        }
        .breadcrumb-root { 
          color: #94a3b8; 
        }
        .breadcrumb-sep { 
          color: #cbd5e1; 
        }
        .breadcrumb-current { 
          color: #1e293b; 
        }
        
        .header-user { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 6px 12px; 
          border-radius: 12px; 
          transition: 0.2s; 
          cursor: pointer; 
        }
        .header-user:hover { 
          background: #f8fafc; 
        }
        .user-info { 
          display: flex; 
          flex-direction: column; 
          align-items: flex-end; 
        }
        .user-name { 
          font-weight: 800; 
          color: #0f172a; 
          font-size: 13px; 
          line-height: 1; 
        }
        .user-role { 
          font-size: 11px; 
          color: #6366f1; 
          font-weight: 800; 
          text-transform: uppercase; 
          margin-top: 4px; 
        }
        .user-avatar { 
          width: 36px; 
          height: 36px; 
          background: #6366f1; 
          color: white; 
          border-radius: 10px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-weight: 800; 
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
        }

        .admin-content-container { 
          display: flex; 
          min-height: calc(100vh - 72px); 
          width: 100%;
          background: #f8fafc;
          overflow: hidden;
        }
        .admin-editor-panel { 
          flex: 0 0 380px; 
          max-width: 380px; 
          padding: 24px; 
          background: #ffffff; 
          border-right: 1px solid #e2e8f0; 
          overflow-y: auto; 
          height: calc(100vh - 72px); 
          box-sizing: border-box;
          box-shadow: 4px 0 15px rgba(0,0,0,0.02);
        }
        .admin-content-container.full-width .admin-editor-panel {
          flex: 1;
          max-width: 100%;
          height: auto;
          overflow-y: visible;
          background: #f8fafc;
          border-right: none;
        }
        .admin-preview-panel { 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          height: calc(100vh - 72px); 
          background: #e2e8f0; 
          position: relative;
        }
        .preview-header { 
          height: 44px; 
          background: #1e293b; 
          color: #e2e8f0; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 0 20px; 
          font-size: 13px; 
          font-weight: 600; 
          border-bottom: 1px solid #334155;
          z-index: 10;
        }
        .preview-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
        }
        .status-dot.pulsing {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .refresh-preview-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }
        .refresh-preview-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        .admin-preview-iframe { 
          flex: 1; 
          width: 100%; 
          border: none; 
          background: white; 
        }
        
        /* Auto wrap table and make cards compact for editor panel */
        .admin-editor-panel table {
          display: block;
          overflow-x: auto;
          max-width: 100%;
        }
        .admin-editor-panel input[type="text"],
        .admin-editor-panel input[type="email"],
        .admin-editor-panel textarea,
        .admin-editor-panel select {
          max-width: 100%;
        }

        /* ===== RESPONSIVE CSS ===== */
        @media (max-width: 1200px) {
          .admin-sidebar { 
            width: 80px; 
          }
          .admin-sidebar .nav-item span,
          .admin-sidebar .sidebar-footer span,
          .admin-logo-box span { 
            display: none; 
          }
          .admin-main { 
            margin-left: 80px !important; 
          }
        }

        @media (max-width: 1024px) {
          .admin-sidebar { 
            left: -260px; 
            width: 260px !important; 
          }
          .admin-sidebar.open { 
            left: 0; 
          }
          .admin-sidebar .nav-item span,
          .admin-sidebar .sidebar-footer span,
          .admin-logo-box span { 
            display: inline-block; 
          }
          .admin-main { 
            margin-left: 0 !important; 
          }
          .menu-toggle { 
            display: flex; 
          }
          .sidebar-overlay { 
            position: fixed; 
            inset: 0; 
            background: rgba(15, 23, 42, 0.5); 
            backdrop-filter: blur(4px); 
            z-index: 45; 
          }
          .header-breadcrumb { 
            display: none; 
          }
        }

        @media (max-width: 1280px) {
          .admin-editor-panel {
            flex: 0 0 460px;
            max-width: 460px;
          }
        }
        @media (max-width: 1024px) {
          .admin-content-container {
            flex-direction: column;
          }
          .admin-editor-panel {
            flex: 1;
            max-width: 100%;
            height: auto;
            overflow-y: visible;
            border-right: none;
          }
          .admin-preview-panel {
            display: none; /* Hide preview to save space on tablets/mobile */
          }
        }

        @media (max-width: 768px) {
          .admin-editor-panel { 
            padding: 16px; 
          }
          .admin-header { 
            padding: 0 16px; 
          }
          .user-info { 
            display: none; 
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
