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

const AboutSectionManager = () => {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Form State
  const [visual_icon, setVisual_icon] = useState('');
  const [isDropdownOpen_visual_icon, setIsDropdownOpen_visual_icon] = useState(false);
  const [quote_text, setQuote_text] = useState('');
  const [additional_text, setAdditional_text] = useState('');
  const [feature_1_icon, setFeature_1_icon] = useState('');
  const [isDropdownOpen_feature_1_icon, setIsDropdownOpen_feature_1_icon] = useState(false);
  const [feature_1_title, setFeature_1_title] = useState('');
  const [feature_1_desc, setFeature_1_desc] = useState('');
  const [feature_2_icon, setFeature_2_icon] = useState('');
  const [isDropdownOpen_feature_2_icon, setIsDropdownOpen_feature_2_icon] = useState(false);
  const [feature_2_title, setFeature_2_title] = useState('');
  const [feature_2_desc, setFeature_2_desc] = useState('');
  const [feature_3_icon, setFeature_3_icon] = useState('');
  const [isDropdownOpen_feature_3_icon, setIsDropdownOpen_feature_3_icon] = useState(false);
  const [feature_3_title, setFeature_3_title] = useState('');
  const [feature_3_desc, setFeature_3_desc] = useState('');
  const [feature_4_icon, setFeature_4_icon] = useState('');
  const [isDropdownOpen_feature_4_icon, setIsDropdownOpen_feature_4_icon] = useState(false);
  const [feature_4_title, setFeature_4_title] = useState('');
  const [feature_4_desc, setFeature_4_desc] = useState('');
  const [status, setStatus] = useState('Active');

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await crudService.getAll('about_section');
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
    formData.append('visual_icon', visual_icon);
    formData.append('quote_text', quote_text);
    formData.append('additional_text', additional_text);
    formData.append('feature_1_icon', feature_1_icon);
    formData.append('feature_1_title', feature_1_title);
    formData.append('feature_1_desc', feature_1_desc);
    formData.append('feature_2_icon', feature_2_icon);
    formData.append('feature_2_title', feature_2_title);
    formData.append('feature_2_desc', feature_2_desc);
    formData.append('feature_3_icon', feature_3_icon);
    formData.append('feature_3_title', feature_3_title);
    formData.append('feature_3_desc', feature_3_desc);
    formData.append('feature_4_icon', feature_4_icon);
    formData.append('feature_4_title', feature_4_title);
    formData.append('feature_4_desc', feature_4_desc);
    formData.append('status', status);

    try {
      if (selectedId) {
        await crudService.update('about_section', selectedId, formData);
        if (!isAuto) showToast('Updated successfully');
        // Hot-reload visual frame dispatch
        window.dispatchEvent(new CustomEvent('api-data-updated'));
      } else {
        await crudService.create('about_section', formData);
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

  // Debounced auto-save watcher engine for About Section 💓
  useEffect(() => {
    if (!showForm || !selectedId) return;
    const timer = setTimeout(() => {
      handleSave(null, true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [
    visual_icon, quote_text, additional_text, status,
    feature_1_icon, feature_1_title, feature_1_desc,
    feature_2_icon, feature_2_title, feature_2_desc,
    feature_3_icon, feature_3_title, feature_3_desc,
    feature_4_icon, feature_4_title, feature_4_desc
  ]);

  const handleDelete = async (id) => {
    try {
      await crudService.delete('about_section', id);
      showToast('Deleted successfully');
      loadData();
    } catch (error) {
      console.error('Delete error detailed:', error);
      showToast('Failed to delete', 'error');
    }
  };

  const resetForm = () => {
    setSelectedId(null);
    setVisual_icon('');
    setQuote_text('');
    setAdditional_text('');
    setFeature_1_icon('');
    setFeature_1_title('');
    setFeature_1_desc('');
    setFeature_2_icon('');
    setFeature_2_title('');
    setFeature_2_desc('');
    setFeature_3_icon('');
    setFeature_3_title('');
    setFeature_3_desc('');
    setFeature_4_icon('');
    setFeature_4_title('');
    setFeature_4_desc('');
    setStatus('Active');
  };

  const openEdit = (item) => {
    setSelectedId(item.id);
    if (item.visual_icon !== undefined && item.visual_icon !== null) {
      setVisual_icon(item.visual_icon);
    } else {
      setVisual_icon('');
    }
    if (item.quote_text !== undefined && item.quote_text !== null) {
      setQuote_text(item.quote_text);
    } else {
      setQuote_text('');
    }
    if (item.additional_text !== undefined && item.additional_text !== null) {
      setAdditional_text(item.additional_text);
    } else {
      setAdditional_text('');
    }
    if (item.feature_1_icon !== undefined && item.feature_1_icon !== null) {
      setFeature_1_icon(item.feature_1_icon);
    } else {
      setFeature_1_icon('');
    }
    if (item.feature_1_title !== undefined && item.feature_1_title !== null) {
      setFeature_1_title(item.feature_1_title);
    } else {
      setFeature_1_title('');
    }
    if (item.feature_1_desc !== undefined && item.feature_1_desc !== null) {
      setFeature_1_desc(item.feature_1_desc);
    } else {
      setFeature_1_desc('');
    }
    if (item.feature_2_icon !== undefined && item.feature_2_icon !== null) {
      setFeature_2_icon(item.feature_2_icon);
    } else {
      setFeature_2_icon('');
    }
    if (item.feature_2_title !== undefined && item.feature_2_title !== null) {
      setFeature_2_title(item.feature_2_title);
    } else {
      setFeature_2_title('');
    }
    if (item.feature_2_desc !== undefined && item.feature_2_desc !== null) {
      setFeature_2_desc(item.feature_2_desc);
    } else {
      setFeature_2_desc('');
    }
    if (item.feature_3_icon !== undefined && item.feature_3_icon !== null) {
      setFeature_3_icon(item.feature_3_icon);
    } else {
      setFeature_3_icon('');
    }
    if (item.feature_3_title !== undefined && item.feature_3_title !== null) {
      setFeature_3_title(item.feature_3_title);
    } else {
      setFeature_3_title('');
    }
    if (item.feature_3_desc !== undefined && item.feature_3_desc !== null) {
      setFeature_3_desc(item.feature_3_desc);
    } else {
      setFeature_3_desc('');
    }
    if (item.feature_4_icon !== undefined && item.feature_4_icon !== null) {
      setFeature_4_icon(item.feature_4_icon);
    } else {
      setFeature_4_icon('');
    }
    if (item.feature_4_title !== undefined && item.feature_4_title !== null) {
      setFeature_4_title(item.feature_4_title);
    } else {
      setFeature_4_title('');
    }
    if (item.feature_4_desc !== undefined && item.feature_4_desc !== null) {
      setFeature_4_desc(item.feature_4_desc);
    } else {
      setFeature_4_desc('');
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
          <h2 className="admin-card-title">About Section</h2>
          <p className="admin-card-subtitle">Manage your About Section section data here.</p>
        </div>
        {!showForm && data.length === 0 && (
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
              <label className="admin-label">visual_icon</label>
              <div className="icon-selector-premium">
                <div className="icon-current" onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen_visual_icon(!isDropdownOpen_visual_icon);
                }}>
                  {(() => { 
                    const iconName = visual_icon;
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
                  <span>{ visual_icon || 'Select Icon' }</span>
                  <LucideIcons.ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                </div>
                {isDropdownOpen_visual_icon && (
                  <div id="icon_dropdown_visual_icon" className="icon-dropdown-grid active">
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
                            className={'icon-grid-item ' + (visual_icon === iconName ? 'active' : '')}
                            data-name={iconName}
                            onClick={() => {
                              setVisual_icon(iconName);
                              setIsDropdownOpen_visual_icon(false);
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
              <label className="admin-label">quote_text</label>
              <textarea className="admin-input" rows="4" value={ quote_text } onChange={(e) => setQuote_text(e.target.value)} placeholder="Enter quote_text..."></textarea>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">additional_text</label>
              <textarea className="admin-input" rows="4" value={ additional_text } onChange={(e) => setAdditional_text(e.target.value)} placeholder="Enter additional_text..."></textarea>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">feature_1_icon</label>
              <div className="icon-selector-premium">
                <div className="icon-current" onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen_feature_1_icon(!isDropdownOpen_feature_1_icon);
                }}>
                  {(() => { 
                    const iconName = feature_1_icon;
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
                  <span>{ feature_1_icon || 'Select Icon' }</span>
                  <LucideIcons.ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                </div>
                {isDropdownOpen_feature_1_icon && (
                  <div id="icon_dropdown_feature_1_icon" className="icon-dropdown-grid active">
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
                            className={'icon-grid-item ' + (feature_1_icon === iconName ? 'active' : '')}
                            data-name={iconName}
                            onClick={() => {
                              setFeature_1_icon(iconName);
                              setIsDropdownOpen_feature_1_icon(false);
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
              <label className="admin-label">feature_1_title</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ feature_1_title } onChange={(e) => setFeature_1_title(e.target.value)} placeholder="Enter feature_1_title..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">feature_1_desc</label>
              <textarea className="admin-input" rows="4" value={ feature_1_desc } onChange={(e) => setFeature_1_desc(e.target.value)} placeholder="Enter feature_1_desc..."></textarea>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">feature_2_icon</label>
              <div className="icon-selector-premium">
                <div className="icon-current" onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen_feature_2_icon(!isDropdownOpen_feature_2_icon);
                }}>
                  {(() => { 
                    const iconName = feature_2_icon;
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
                  <span>{ feature_2_icon || 'Select Icon' }</span>
                  <LucideIcons.ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                </div>
                {isDropdownOpen_feature_2_icon && (
                  <div id="icon_dropdown_feature_2_icon" className="icon-dropdown-grid active">
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
                            className={'icon-grid-item ' + (feature_2_icon === iconName ? 'active' : '')}
                            data-name={iconName}
                            onClick={() => {
                              setFeature_2_icon(iconName);
                              setIsDropdownOpen_feature_2_icon(false);
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
              <label className="admin-label">feature_2_title</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ feature_2_title } onChange={(e) => setFeature_2_title(e.target.value)} placeholder="Enter feature_2_title..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">feature_2_desc</label>
              <textarea className="admin-input" rows="4" value={ feature_2_desc } onChange={(e) => setFeature_2_desc(e.target.value)} placeholder="Enter feature_2_desc..."></textarea>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">feature_3_icon</label>
              <div className="icon-selector-premium">
                <div className="icon-current" onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen_feature_3_icon(!isDropdownOpen_feature_3_icon);
                }}>
                  {(() => { 
                    const iconName = feature_3_icon;
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
                  <span>{ feature_3_icon || 'Select Icon' }</span>
                  <LucideIcons.ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                </div>
                {isDropdownOpen_feature_3_icon && (
                  <div id="icon_dropdown_feature_3_icon" className="icon-dropdown-grid active">
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
                            className={'icon-grid-item ' + (feature_3_icon === iconName ? 'active' : '')}
                            data-name={iconName}
                            onClick={() => {
                              setFeature_3_icon(iconName);
                              setIsDropdownOpen_feature_3_icon(false);
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
              <label className="admin-label">feature_3_title</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ feature_3_title } onChange={(e) => setFeature_3_title(e.target.value)} placeholder="Enter feature_3_title..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">feature_3_desc</label>
              <textarea className="admin-input" rows="4" value={ feature_3_desc } onChange={(e) => setFeature_3_desc(e.target.value)} placeholder="Enter feature_3_desc..."></textarea>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">feature_4_icon</label>
              <div className="icon-selector-premium">
                <div className="icon-current" onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen_feature_4_icon(!isDropdownOpen_feature_4_icon);
                }}>
                  {(() => { 
                    const iconName = feature_4_icon;
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
                  <span>{ feature_4_icon || 'Select Icon' }</span>
                  <LucideIcons.ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                </div>
                {isDropdownOpen_feature_4_icon && (
                  <div id="icon_dropdown_feature_4_icon" className="icon-dropdown-grid active">
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
                            className={'icon-grid-item ' + (feature_4_icon === iconName ? 'active' : '')}
                            data-name={iconName}
                            onClick={() => {
                              setFeature_4_icon(iconName);
                              setIsDropdownOpen_feature_4_icon(false);
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
              <label className="admin-label">feature_4_title</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ feature_4_title } onChange={(e) => setFeature_4_title(e.target.value)} placeholder="Enter feature_4_title..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">feature_4_desc</label>
              <textarea className="admin-input" rows="4" value={ feature_4_desc } onChange={(e) => setFeature_4_desc(e.target.value)} placeholder="Enter feature_4_desc..."></textarea>
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
          <GlobalHeadingEditor slug="about_section" />
          <div className="admin-vertical-card-grid">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', color: '#64748b', gridColumn: '1/-1' }}>
                <Loader2 size={24} className="animate-spin" style={{ marginRight: '10px' }} />
                <span>Loading About configurations...</span>
              </div>
            ) : filteredData.length > 0 ? filteredData.map((item, idx) => (
              <div className="admin-info-card clickable-setup-card" key={item.id} onClick={() => openEdit(item)} style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}>
                <div className="admin-info-row">
                  <span className="admin-info-label">Visual Icon</span>
                  <div className="admin-info-value">
                    <div className="admin-card-icon-box">
                      {(() => { 
                        const iconName = item.visual_icon;
                        const brandIcons = {
                          Facebook: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
                          Twitter: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C4.2 17 2.8 14.8 2.3 12c.8.1 1.6 0 2.4-.2C2 11.2.8 9.1.8 6.8c.6.3 1.3.5 2.1.5C1.1 6 1.4 3.1 3.5 1.5c2.3 2.8 5.7 4.5 9.5 4.7-.1-.4-.2-.8-.2-1.2 0-3.3 2.7-6 6-6 1.5 0 3 .6 4 1.7 1.2-.2 2.5-.7 3.5-1.3-.4 1.3-1.3 2.4-2.4 3z"/></svg>,
                          Instagram: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
                          Linkedin: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>,
                          Youtube: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>,
                          Github: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>,
                          Twitch: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-2 13l-3 3H9l-3-3V4h13v11z"/><path d="M14 8h2v4h-2V8zm-5 0h2v4H9V8z"/></svg>,
                          Slack: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="4" height="4" x="13" y="2" rx="2"/><rect width="4" height="4" x="2" y="13" rx="2"/><rect width="4" height="4" x="20" y="13" rx="2"/><path d="M10 7a3 3 0 0 1-3-3 3 3 0 0 1 3 3v3H7"/><path d="M14 7v3h3a3 3 0 0 1-3-3v0z"/><path d="M14 17a3 3 0 0 1 3 3 3 3 0 0 1-3-3v-3h3"/><path d="M10 17v-3H7a3 3 0 0 1 3 3v0z"/></svg>,
                          Tiktok: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>,
                          Pinterest: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22c-.66-4.14.73-7.61 1.76-11.08C9.28 9.3 9.94 7.63 11.23 7c1.32-.64 2.89.04 3.2 1.62.38 1.94-.96 4.34-1.63 6.38-.2 1.12.56 2.1 1.66 2.1 3.01 0 5.22-3.83 5.22-7.85 0-3.6-2.58-6.13-6.66-6.13-4.52 0-7.44 3.14-7.44 6.84 0 1.25.33 2.41 1 3.32-.4 1.14-.33 2.15-.17 3.23-2.1-2.45-2.28-5.36-1.57-8.15C5.81 4.56 9.68 2 14.18 2c5.63 0 9.25 4 9.25 8.73 0 5.75-3.25 10.27-8.13 10.27-1.61 0-3.13-.88-3.65-1.92L10 22z"/></svg>,
                          Snapchat: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c2.5 0 4.5 1.5 5 3.5 1.2 0 2 .8 2 2 0 1-.5 1.5-1.5 2 1.5 2 2.5 4.5 1.5 6-.5.8-1.5 1-2.5 1-.2 1-.5 1.5-1 1.5-1.5 0-2.5-.5-2.5-1.5 0 1-.8 1.5-2 1.5-1.5 0-2.5-.5-2.5-1.5-.5 0-.8-.5-1-1.5-1 0-2-.2-2.5-1-1-1.5 0-4 1.5-6-1-.5-1.5-1-1.5-2 0-1.2.8-2 2-2 .5-2 2.5-3.5 5-3.5z"/></svg>,
                          Whatsapp: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
                          Telegram: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
                          Reddit: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="13" rx="5" ry="3"/></svg>,
                          Discord: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M7.5 7.5S9 6 12 6s4.5 1.5 4.5 1.5-1.5 3-1.5 5.5.5 2.5.5 2.5-1.5.5-3.5.5-3.5-.5-3.5-.5.5 0 .5-2.5-1.5-2.5-1.5-5.5z"/></svg>
                        };
                        if (brandIcons[iconName]) return brandIcons[iconName];
                        const Icon = (iconName && iconName !== 'Icon' && LucideIcons[iconName]) || LucideIcons.HelpCircle; 
                        return <Icon size={18} />; 
                      })()}
                    </div>
                  </div>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">Quote Text</span>
                  <div className="admin-info-value" style={{ fontStyle: 'italic', fontSize: '13px' }}>
                    {item.quote_text ? (item.quote_text.length > 60 ? item.quote_text.substring(0, 60) + '...' : item.quote_text) : '-'}
                  </div>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">Additional Text</span>
                  <div className="admin-info-value" style={{ fontSize: '13px', color: '#475569' }}>
                    {item.additional_text ? (item.additional_text.length > 60 ? item.additional_text.substring(0, 60) + '...' : item.additional_text) : '-'}
                  </div>
                </div>
                
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                  <div className="admin-info-label" style={{ marginBottom: '12px' }}>Dynamic Features List</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[1, 2, 3, 4].map(num => {
                      const iconName = item[`feature_${num}_icon`];
                      const title = item[`feature_${num}_title`];
                      const Icon = (iconName && iconName !== 'Icon' && LucideIcons[iconName]) || LucideIcons.HelpCircle;
                      return (
                        <div key={num} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: 0 }}>
                          <div style={{ color: '#4f46e5', flexShrink: 0 }}><Icon size={14} /></div>
                          <div style={{ fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>{title?.trim() || `Feature ${num}`}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="admin-info-row">
                  <span className="admin-info-label">Status</span>
                  <div className="admin-info-value">
                    <span className={`admin-status-badge admin-status-${item.status?.toLowerCase() || 'active'}`}>
                      {item.status || 'Active'}
                    </span>
                  </div>
                </div>

              </div>
            )) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#94a3b8', background: '#ffffff', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
                No About data configured.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AboutSectionManager;
