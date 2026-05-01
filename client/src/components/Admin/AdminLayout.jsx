import './Admin.css';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);

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

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  const navItems = [
    { title: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
// [START_GENERATED_NAV_ITEMS]
{ title: 'About Section', path: '/admin/about_section', icon: 'Album' },
    { title: 'Book Your Appointment ', path: '/admin/book_your_appointment', icon: 'Sparkles' },
    { title: 'Doctors List', path: '/admin/doctors_list', icon: 'Apple' },
    { title: 'Doctors Section', path: '/admin/doctors_section', icon: 'Aperture' },
    { title: 'Footer', path: '/admin/footer', icon: 'Footprints' },
    { title: 'Hero Section', path: '/admin/hero_section', icon: 'Home' },
    { title: 'Navigation Bar ', path: '/admin/navigation_bar', icon: 'Navigation' },
    { title: 'Service List ', path: '/admin/service_list', icon: 'ClipboardList' },
    { title: 'Testimonial Section ', path: '/admin/testimonial_section', icon: 'TestTube' },
    { title: 'Testimonials_List ', path: '/admin/testimonials_list', icon: 'TestTubeDiagonal' },
    { title: 'Why Hijama ', path: '/admin/why_hijama', icon: 'ActivitySquare' },
    { title: 'services_section', path: '/admin/services_section', icon: 'Workflow' },
// [END_GENERATED_NAV_ITEMS]
  ];

  const currentPath = location.pathname;
  const currentItem = navItems.find(item => item.path === currentPath) || { title: 'Admin' };

  return (
    <div className="admin-container">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && window.innerWidth <= 1024 && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="admin-logo-box">
            <div className="logo-icon">
              <LucideIcons.ShieldCheck size={24} color="#6366f1" />
            </div>
            <span>Admin Suite</span>
          </div>
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <LucideIcons.ChevronLeft size={18} /> : <LucideIcons.ChevronRight size={18} />}
          </button>
        </div>

        <div className="sidebar-nav">
          {navItems.map((item, idx) => {
            const Icon = LucideIcons[item.icon] || LucideIcons.Circle;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={idx} 
                to={item.path} 
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={!isSidebarOpen ? item.title : ''}
              >
                <Icon size={20} />
                {isSidebarOpen && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LucideIcons.LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              <LucideIcons.Menu size={22} />
            </button>
            <div className="header-breadcrumb">
              <span className="breadcrumb-root">Admin</span>
              <LucideIcons.ChevronRight size={14} className="breadcrumb-sep" />
              <span className="breadcrumb-current">{currentItem.title}</span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="header-user">
              <div className="user-info">
                <span className="user-name">{adminUser?.name || 'Administrator'}</span>
                <span className="user-role">Admin</span>
              </div>
              <div className="user-avatar">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>

      <style>{`
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

        .admin-content { 
          padding: 32px; 
          min-height: calc(100vh - 72px); 
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

        @media (max-width: 768px) {
          .admin-content { 
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
