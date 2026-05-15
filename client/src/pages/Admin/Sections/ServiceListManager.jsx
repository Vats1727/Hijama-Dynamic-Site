import React, { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  Pencil, Trash2, Search, PlusCircle, X, AlertTriangle, 
  Settings, Image as ImageIcon, CheckCircle2, Star,
  Upload, Plus, File, DollarSign, Percent, HelpCircle,
  Loader2
} from 'lucide-react';
import api, { getImageUrl } from '../../../services/api';
import { crudService } from '../../../services/crud';
import { useToast } from '../../../components/Admin/ToastContext';
import GlobalHeadingEditor from '../../../components/Admin/GlobalHeadingEditor';
import { renderDynamicIcon } from '../../../utils/IconRenderer';

const ServiceListManager = () => {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Form State
  const [icon, setIcon] = useState('');
  const [isDropdownOpen_icon, setIsDropdownOpen_icon] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState('Active');

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await crudService.getAll('service_list');
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Failed to fetch data', error);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Close icon dropdowns on outside click
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.icon-selector-premium')) {
        document.querySelectorAll('.icon-dropdown-grid').forEach(d => d.classList.remove('active'));
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSave = async (e = null, isAuto = false) => {
    if (e) e.preventDefault();
    if (isSaving && !isAuto) return;

    if (!isAuto) setIsSaving(true);
    // Use FormData for robust file handling
    const formData = new FormData();
    formData.append('icon', icon);
    formData.append('name', name);
    formData.append('desc', desc);
    formData.append('price', price);
    if (image && typeof image === 'object') formData.append('image', image);
    formData.append('details', details);
    formData.append('status', status);

    try {
      if (selectedId) {
        await crudService.update('service_list', selectedId, formData);
        if (!isAuto) showToast('Updated successfully');
        // Trigger immediate visual hot-reload on user simulator layouts!
        window.dispatchEvent(new CustomEvent('api-data-updated'));
      } else {
        await crudService.create('service_list', formData);
        if (!isAuto) showToast('Created successfully');
      }
      if (!isAuto) {
        setShowForm(false);
        resetForm();
      }
      loadData();
    } catch (error) {
      if (!isAuto) {
        console.error('Save error detailed:', error);
        showToast(error.message || 'Failed to save', 'error');
      }
    } finally {
      if (!isAuto) setIsSaving(false);
    }
  };

  // Intelligent debounce auto-save controller for services 💓
  useEffect(() => {
    if (!showForm || !selectedId) return;
    const timer = setTimeout(() => {
      handleSave(null, true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [icon, name, desc, price, details, status, image]);

  const handleDelete = async (id) => {
    try {
      await crudService.delete('service_list', id);
      showToast('Deleted successfully');
      loadData();
    } catch (error) {
      console.error('Delete error detailed:', error);
      showToast('Failed to delete', 'error');
    }
  };

  const resetForm = () => {
    setSelectedId(null);
    setIcon('');
    setName('');
    setDesc('');
    setPrice('');
    setImage(null);
    setImagePreview('');
    setDetails('');
    setStatus('Active');
  };

  const openEdit = (item) => {
    setSelectedId(item.id);
    if (item.icon !== undefined && item.icon !== null) {
      setIcon(item.icon);
    } else {
      setIcon('');
    }
    if (item.name !== undefined && item.name !== null) {
      setName(item.name);
    } else {
      setName('');
    }
    if (item.desc !== undefined && item.desc !== null) {
      setDesc(item.desc);
    } else {
      setDesc('');
    }
    if (item.price !== undefined && item.price !== null) {
      setPrice(item.price);
    } else {
      setPrice('');
    }
    setImagePreview(item.image ? getImageUrl(item.image) : '');
    if (item.details !== undefined && item.details !== null) {
      setDetails(item.details);
    } else {
      setDetails('');
    }
    setStatus(item.status || 'Active');
    setShowForm(true);
  };

  const filteredData = data.filter(item => 
    Object.values(item).some(val => {
      if (typeof val === 'object' && val !== null) {
        return JSON.stringify(val).toLowerCase().includes(searchTerm.toLowerCase());
      }
      return String(val).toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  return (
    <div className="admin-section">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Service List </h2>
          <p className="admin-card-subtitle">Manage your Service List  section data here.</p>
        </div>
        {!showForm && (
          <button className="admin-btn admin-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            <PlusCircle size={16} /> Add New
          </button>
        )}
      </div>

      {showForm ? (
        <div className="admin-card">
          <form onSubmit={handleSave}>
            <div className="admin-form-grid">
            <div className="admin-form-group">
              <label className="admin-label">icon</label>
              <div className="icon-selector-premium">
                <div className="icon-current" onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen_icon(!isDropdownOpen_icon);
                }}>
                  {(() => { 
                    const iconName = icon;
                    const brandIcons = {
                      Facebook: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
                      Twitter: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C4.2 17 2.8 14.8 2.3 12c.8.1 1.6 0 2.4-.2C2 11.2.8 9.1.8 6.8c.6.3 1.3.5 2.1.5C1.1 6 1.4 3.1 3.5 1.5c2.3 2.8 5.7 4.5 9.5 4.7-.1-.4-.2-.8-.2-1.2 0-3.3 2.7-6 6-6 1.5 0 3 .6 4 1.7 1.2-.2 2.5-.7 3.5-1.3-.4 1.3-1.3 2.4-2.4 3z"/></svg>,
                      Instagram: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
                      Linkedin: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>,
                      Youtube: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>,
                      Github: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>,
                      Twitch: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-2 13l-3 3H9l-3-3V4h13v11z"/><path d="M14 8h2v4h-2V8zm-5 0h2v4H9V8z"/></svg>,
                      Slack: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="4" height="4" x="13" y="2" rx="2"/><rect width="4" height="4" x="2" y="13" rx="2"/><rect width="4" height="4" x="20" y="13" rx="2"/><path d="M10 7a3 3 0 0 1-3-3 3 3 0 0 1 3 3v3H7"/><path d="M14 7v3h3a3 3 0 0 1-3-3v0z"/><path d="M14 17a3 3 0 0 1 3 3 3 3 0 0 1-3-3v-3h3"/><path d="M10 17v-3H7a3 3 0 0 1 3 3v0z"/></svg>,
                      Tiktok: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>,
                      Pinterest: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22c-.66-4.14.73-7.61 1.76-11.08C9.28 9.3 9.94 7.63 11.23 7c1.32-.64 2.89.04 3.2 1.62.38 1.94-.96 4.34-1.63 6.38-.2 1.12.56 2.1 1.66 2.1 3.01 0 5.22-3.83 5.22-7.85 0-3.6-2.58-6.13-6.66-6.13-4.52 0-7.44 3.14-7.44 6.84 0 1.25.33 2.41 1 3.32-.4 1.14-.33 2.15-.17 3.23-2.1-2.45-2.28-5.36-1.57-8.15C5.81 4.56 9.68 2 14.18 2c5.63 0 9.25 4 9.25 8.73 0 5.75-3.25 10.27-8.13 10.27-1.61 0-3.13-.88-3.65-1.92L10 22z"/></svg>,
                      Snapchat: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c2.5 0 4.5 1.5 5 3.5 1.2 0 2 .8 2 2 0 1-.5 1.5-1.5 2 1.5 2 2.5 4.5 1.5 6-.5.8-1.5 1-2.5 1-.2 1-.5 1.5-1 1.5-1.5 0-2.5-.5-2.5-1.5 0 1-.8 1.5-2 1.5-1.5 0-2.5-.5-2.5-1.5-.5 0-.8-.5-1-1.5-1 0-2-.2-2.5-1-1-1.5 0-4 1.5-6-1-.5-1.5-1-1.5-2 0-1.2.8-2 2-2 .5-2 2.5-3.5 5-3.5z"/></svg>,
                      Whatsapp: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
                      Telegram: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
                      Reddit: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="13" rx="5" ry="3"/></svg>,
                      Discord: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M7.5 7.5S9 6 12 6s4.5 1.5 4.5 1.5-1.5 3-1.5 5.5.5 2.5.5 2.5-1.5.5-3.5.5-3.5-.5-3.5-.5.5 0 .5-2.5-1.5-2.5-1.5-5.5z"/></svg>
                    };
                    if (brandIcons[iconName]) return brandIcons[iconName];
                    const Icon = (iconName && iconName !== 'Icon' && LucideIcons[iconName]) || LucideIcons.HelpCircle; 
                    return <Icon size={20} />; 
                  })()}
                  <span>{ icon || 'Select Icon' }</span>
                  <LucideIcons.ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                </div>
                {isDropdownOpen_icon && (
                  <div id="icon_dropdown_icon" className="icon-dropdown-grid active">
                    <div className="icon-search-bar">
                      <LucideIcons.Search size={14} />
                      <input 
                        type="text" 
                        placeholder="Search icons..." 
                        onKeyUp={(e) => {
                          const term = e.target.value.toLowerCase();
                          const items = e.target.closest('.icon-dropdown-grid').querySelectorAll('.icon-grid-item');
                          items.forEach(item => {
                            const name = item.getAttribute('data-name').toLowerCase();
                            item.style.display = name.includes(term) ? 'flex' : 'none';
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="icon-grid-scroll">
                      {[
                        'Facebook', 'Twitter', 'Instagram', 'Linkedin', 'Youtube', 'Github', 'Twitch', 'Slack', 'Tiktok', 'Pinterest', 'Snapchat', 'Whatsapp', 'Telegram', 'Reddit', 'Discord',
                        ...Object.keys(LucideIcons).filter(key => /^[A-Z]/.test(key) && key !== 'Icon' && key !== 'Lucide' && (typeof LucideIcons[key] === 'function' || typeof LucideIcons[key] === 'object'))
                      ].map(iconName => {
                        const brandIcons = {
                          Facebook: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
                          Twitter: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C4.2 17 2.8 14.8 2.3 12c.8.1 1.6 0 2.4-.2C2 11.2.8 9.1.8 6.8c.6.3 1.3.5 2.1.5C1.1 6 1.4 3.1 3.5 1.5c2.3 2.8 5.7 4.5 9.5 4.7-.1-.4-.2-.8-.2-1.2 0-3.3 2.7-6 6-6 1.5 0 3 .6 4 1.7 1.2-.2 2.5-.7 3.5-1.3-.4 1.3-1.3 2.4-2.4 3z"/></svg>,
                          Instagram: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
                          Linkedin: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>,
                          Youtube: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>,
                          Github: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>,
                          Twitch: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-2 13l-3 3H9l-3-3V4h13v11z"/><path d="M14 8h2v4h-2V8zm-5 0h2v4H9V8z"/></svg>,
                          Slack: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="4" height="4" x="13" y="2" rx="2"/><rect width="4" height="4" x="2" y="13" rx="2"/><rect width="4" height="4" x="20" y="13" rx="2"/><path d="M10 7a3 3 0 0 1-3-3 3 3 0 0 1 3 3v3H7"/><path d="M14 7v3h3a3 3 0 0 1-3-3v0z"/><path d="M14 17a3 3 0 0 1 3 3 3 3 0 0 1-3-3v-3h3"/><path d="M10 17v-3H7a3 3 0 0 1 3 3v0z"/></svg>,
                          Tiktok: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>,
                          Pinterest: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22c-.66-4.14.73-7.61 1.76-11.08C9.28 9.3 9.94 7.63 11.23 7c1.32-.64 2.89.04 3.2 1.62.38 1.94-.96 4.34-1.63 6.38-.2 1.12.56 2.1 1.66 2.1 3.01 0 5.22-3.83 5.22-7.85 0-3.6-2.58-6.13-6.66-6.13-4.52 0-7.44 3.14-7.44 6.84 0 1.25.33 2.41 1 3.32-.4 1.14-.33 2.15-.17 3.23-2.1-2.45-2.28-5.36-1.57-8.15C5.81 4.56 9.68 2 14.18 2c5.63 0 9.25 4 9.25 8.73 0 5.75-3.25 10.27-8.13 10.27-1.61 0-3.13-.88-3.65-1.92L10 22z"/></svg>,
                          Snapchat: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c2.5 0 4.5 1.5 5 3.5 1.2 0 2 .8 2 2 0 1-.5 1.5-1.5 2 1.5 2 2.5 4.5 1.5 6-.5.8-1.5 1-2.5 1-.2 1-.5 1.5-1 1.5-1.5 0-2.5-.5-2.5-1.5 0 1-.8 1.5-2 1.5-1.5 0-2.5-.5-2.5-1.5-.5 0-.8-.5-1-1.5-1 0-2-.2-2.5-1-1-1.5 0-4 1.5-6-1-.5-1.5-1-1.5-2 0-1.2.8-2 2-2 .5-2 2.5-3.5 5-3.5z"/></svg>,
                          Whatsapp: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
                          Telegram: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
                          Reddit: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="13" rx="5" ry="3"/></svg>,
                          Discord: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M7.5 7.5S9 6 12 6s4.5 1.5 4.5 1.5-1.5 3-1.5 5.5.5 2.5.5 2.5-1.5.5-3.5.5-3.5-.5-3.5-.5.5 0 .5-2.5-1.5-2.5-1.5-5.5z"/></svg>
                        };
                        const Icon = brandIcons[iconName] || ((iconName && iconName !== 'Icon' && LucideIcons[iconName]) ? React.createElement(LucideIcons[iconName], { size: 16 }) : <LucideIcons.HelpCircle size={16} />);
                        return (
                          <div 
                            key={iconName} 
                            className={'icon-grid-item ' + (icon === iconName ? 'active' : '')}
                            data-name={iconName}
                            onClick={() => {
                              setIcon(iconName);
                              setIsDropdownOpen_icon(false);
                            }}
                          >
                            {typeof Icon === 'object' && React.isValidElement(Icon) ? Icon : <LucideIcons.HelpCircle size={16} />}
                            <span>{iconName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">name</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ name } onChange={(e) => setName(e.target.value)} placeholder="Enter name..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">desc</label>
              <textarea className="admin-input" rows="4" value={ desc } onChange={(e) => setDesc(e.target.value)} placeholder="Enter desc..."></textarea>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">price</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ price } onChange={(e) => setPrice(e.target.value)} placeholder="Enter price..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">image</label>
              <div className="image-upload-box-premium">
                { imagePreview ? (
                  <div className="preview-wrap-premium">
                    { 'image' === 'image' ? <img src={ imagePreview } alt="Preview" /> : <div className="file-preview-placeholder"><LucideIcons.ImageIcon size={48} /><span>{ typeof image === 'string' ? image : 'File Uploaded' }</span></div> }
                    <button type="button" className="remove-img-premium" onClick={() => { setImage(null); setImagePreview(''); }} title="Remove">
                      <LucideIcons.XCircle size={ 22 } />
                    </button>
                  </div>
                ) : (
                  <label className="upload-placeholder-premium">
                    <LucideIcons.UploadCloud size={ 32 } />
                    <span>Click to upload image</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if(file) { setImage(file); setImagePreview(URL.createObjectURL(file)); } }} />
                  </label>
                )}
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">details</label>
              <textarea className="admin-input" rows="4" value={ details } onChange={(e) => setDetails(e.target.value)} placeholder="Enter details..."></textarea>
            </div>
            </div>

            <div className="admin-form-group" style={{ marginTop: '20px' }}>
              <label className="admin-label">Status</label>
              <div className="status-toggle-premium" onClick={() => setStatus(status === 'Active' ? 'Inactive' : 'Active')}>
                <div className={`toggle-track ${status === 'Active' ? 'active' : ''}`}>
                  <div className="toggle-thumb"></div>
                </div>
                <span className="status-label">{status}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowForm(false)}>Dismiss</button>
              {selectedId ? (
                <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '750', display: 'flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', padding: '6px 12px', borderRadius: '20px', border: '1px solid #a7f3d0' }}>
                  <LucideIcons.Sparkles size={14} className="animate-pulse" /> Auto-save active
                </div>
              ) : (
                <button type="submit" className="admin-btn admin-btn-primary" disabled={isSaving}>
                  {isSaving ? (
                    <><Loader2 size={16} className="animate-spin" /> Creating...</>
                  ) : 'Create & Initialize'}
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <>
          <GlobalHeadingEditor slug="services_section" fieldMap={{ desc: 'desc_' }} />
          <div className="admin-card">

          <div className="admin-vertical-card-grid">
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Loading services...</span>
                </div>
              </div>
            ) : filteredData.length > 0 ? filteredData.map((item) => (
              <div className="admin-info-card clickable-setup-card" key={item.id} onClick={() => openEdit(item)} style={{ cursor: 'pointer', transition: 'transform 0.2s ease', position: 'relative' }}>
                {/* Sleek Absolute Delete 'X' Icon at Top-Right */}
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: '100',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#ef4444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  title="Delete Service"
                >
                  <X size={13} strokeWidth={3} />
                </button>
                <div className="admin-info-row" style={{ background: '#f8fafc', margin: '-20px -20px 16px -20px', padding: '20px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', paddingRight: '36px' }}>
                    {item.image ? (
                      <img src={getImageUrl(item.image)} alt="Service Thumbnail" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={18} style={{ color: '#94a3b8' }} />
                      </div>
                    )}
                    
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {renderDynamicIcon(item.icon, 16, <LucideIcons.Activity size={16} color="#3b82f6" />)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                        <span className={`admin-status-badge admin-status-${item.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                          {item.status || 'Active'}
                        </span>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', fontWeight: '700', fontSize: '11px', padding: '2px 8px', borderRadius: '12px' }}>
                        <LucideIcons.Tag size={12} /> {item.price || 'TBD'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="admin-info-row">
                  <span className="admin-info-label">Teaser Description</span>
                  <div className="admin-info-value" style={{ color: '#475569', fontSize: '13px' }}>{item.desc || '-'}</div>
                </div>

                <div className="admin-info-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <span className="admin-info-label" style={{ marginBottom: '4px' }}>Full Service Details</span>
                  <div style={{ background: '#fafafa', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', color: '#334155', border: '1px solid #f1f5f9', maxHeight: '100px', overflowY: 'auto' }}>
                    {item.details || 'No breakdown details provided.'}
                  </div>
                </div>




              </div>
            )) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#fff', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                No services listed yet. Click "Add New" to get started.
              </div>
            )}
          </div>

        </div>
        </>
      )}
    </div>
  );
};

export default ServiceListManager;
