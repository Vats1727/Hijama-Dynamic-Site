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

const FooterManager = () => {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Form State
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [brand_desc, setBrand_desc] = useState('');
  const [facebook_link, setFacebook_link] = useState('');
  const [facebook, setFacebook] = useState('');
  const [isDropdownOpen_facebook, setIsDropdownOpen_facebook] = useState(false);
  const [instagram, setInstagram] = useState('');
  const [isDropdownOpen_instagram, setIsDropdownOpen_instagram] = useState(false);
  const [instagram_link, setInstagram_link] = useState('');
  const [youtube, setYoutube] = useState('');
  const [isDropdownOpen_youtube, setIsDropdownOpen_youtube] = useState(false);
  const [youtube_link, setYoutube_link] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isDropdownOpen_whatsapp, setIsDropdownOpen_whatsapp] = useState(false);
  const [whatsapp_link, setWhatsapp_link] = useState('');
  const [copyright, setCopyright] = useState('');
  const [copyright_link, setCopyright_link] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [privacy_link, setPrivacy_link] = useState('');
  const [terms_, setTerms_] = useState('');
  const [terms_link, setTerms_link] = useState('');
  const [site_maps_, setSite_maps_] = useState('');
  const [site_maps_link, setSite_maps_link] = useState('');
  const [status, setStatus] = useState('Active');

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await crudService.getAll('footer');
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    // Validation


    setIsSaving(true);
    // Use FormData for robust file handling
    const formData = new FormData();
    if (logo && typeof logo === 'object') formData.append('logo', logo);
    formData.append('brand_desc', brand_desc);
    formData.append('facebook_link', facebook_link);
    formData.append('facebook', facebook);
    formData.append('instagram', instagram);
    formData.append('instagram_link', instagram_link);
    formData.append('youtube', youtube);
    formData.append('youtube_link', youtube_link);
    formData.append('whatsapp', whatsapp);
    formData.append('whatsapp_link', whatsapp_link);
    formData.append('copyright', copyright);
    formData.append('copyright_link', copyright_link);
    formData.append('privacy', privacy);
    formData.append('privacy_link', privacy_link);
    formData.append('terms_', terms_);
    formData.append('terms_link', terms_link);
    formData.append('site_maps_', site_maps_);
    formData.append('site_maps_link', site_maps_link);
    formData.append('status', status);

    try {
      if (selectedId) {
        await crudService.update('footer', selectedId, formData);
        showToast('Updated successfully');
      } else {
        await crudService.create('footer', formData);
        showToast('Created successfully');
      }
      setShowForm(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Save error detailed:', error);
      showToast(error.message || 'Failed to save', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await crudService.delete('footer', id);
      showToast('Deleted successfully');
      loadData();
    } catch (error) {
      console.error('Delete error detailed:', error);
      showToast('Failed to delete', 'error');
    }
  };

  const resetForm = () => {
    setSelectedId(null);
    setLogo(null);
    setLogoPreview('');
    setBrand_desc('');
    setFacebook_link('');
    setFacebook('');
    setInstagram('');
    setInstagram_link('');
    setYoutube('');
    setYoutube_link('');
    setWhatsapp('');
    setWhatsapp_link('');
    setCopyright('');
    setCopyright_link('');
    setPrivacy('');
    setPrivacy_link('');
    setTerms_('');
    setTerms_link('');
    setSite_maps_('');
    setSite_maps_link('');
    setStatus('Active');
  };

  const openEdit = (item) => {
    setSelectedId(item.id);
    setLogoPreview(item.logo ? getImageUrl(item.logo) : '');
    if (item.brand_desc !== undefined && item.brand_desc !== null) {
      setBrand_desc(item.brand_desc);
    } else {
      setBrand_desc('');
    }
    if (item.facebook_link !== undefined && item.facebook_link !== null) {
      setFacebook_link(item.facebook_link);
    } else {
      setFacebook_link('');
    }
    if (item.facebook !== undefined && item.facebook !== null) {
      setFacebook(item.facebook);
    } else {
      setFacebook('');
    }
    if (item.instagram !== undefined && item.instagram !== null) {
      setInstagram(item.instagram);
    } else {
      setInstagram('');
    }
    if (item.instagram_link !== undefined && item.instagram_link !== null) {
      setInstagram_link(item.instagram_link);
    } else {
      setInstagram_link('');
    }
    if (item.youtube !== undefined && item.youtube !== null) {
      setYoutube(item.youtube);
    } else {
      setYoutube('');
    }
    if (item.youtube_link !== undefined && item.youtube_link !== null) {
      setYoutube_link(item.youtube_link);
    } else {
      setYoutube_link('');
    }
    if (item.whatsapp !== undefined && item.whatsapp !== null) {
      setWhatsapp(item.whatsapp);
    } else {
      setWhatsapp('');
    }
    if (item.whatsapp_link !== undefined && item.whatsapp_link !== null) {
      setWhatsapp_link(item.whatsapp_link);
    } else {
      setWhatsapp_link('');
    }
    if (item.copyright !== undefined && item.copyright !== null) {
      setCopyright(item.copyright);
    } else {
      setCopyright('');
    }
    if (item.copyright_link !== undefined && item.copyright_link !== null) {
      setCopyright_link(item.copyright_link);
    } else {
      setCopyright_link('');
    }
    if (item.privacy !== undefined && item.privacy !== null) {
      setPrivacy(item.privacy);
    } else {
      setPrivacy('');
    }
    if (item.privacy_link !== undefined && item.privacy_link !== null) {
      setPrivacy_link(item.privacy_link);
    } else {
      setPrivacy_link('');
    }
    if (item.terms_ !== undefined && item.terms_ !== null) {
      setTerms_(item.terms_);
    } else {
      setTerms_('');
    }
    if (item.terms_link !== undefined && item.terms_link !== null) {
      setTerms_link(item.terms_link);
    } else {
      setTerms_link('');
    }
    if (item.site_maps_ !== undefined && item.site_maps_ !== null) {
      setSite_maps_(item.site_maps_);
    } else {
      setSite_maps_('');
    }
    if (item.site_maps_link !== undefined && item.site_maps_link !== null) {
      setSite_maps_link(item.site_maps_link);
    } else {
      setSite_maps_link('');
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
          <h2 className="admin-card-title">Footer</h2>
          <p className="admin-card-subtitle">Manage your Footer section data here.</p>
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
              <label className="admin-label">logo</label>
              <div className="image-upload-box-premium">
                { logoPreview ? (
                  <div className="preview-wrap-premium">
                    { 'image' === 'image' ? <img src={ logoPreview } alt="Preview" /> : <div className="file-preview-placeholder"><LucideIcons.ImageIcon size={48} /><span>{ typeof logo === 'string' ? logo : 'File Uploaded' }</span></div> }
                    <button type="button" className="remove-img-premium" onClick={() => { setLogo(null); setLogoPreview(''); }} title="Remove">
                      <LucideIcons.XCircle size={ 22 } />
                    </button>
                  </div>
                ) : (
                  <label className="upload-placeholder-premium">
                    <LucideIcons.UploadCloud size={ 32 } />
                    <span>Click to upload logo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if(file) { setLogo(file); setLogoPreview(URL.createObjectURL(file)); } }} />
                  </label>
                )}
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">brand_desc</label>
              <textarea className="admin-input" rows="4" value={ brand_desc } onChange={(e) => setBrand_desc(e.target.value)} placeholder="Enter brand_desc..."></textarea>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">facebook_link</label>
              <div className="input-wrapper-premium">
                
                <input type="url"  className="admin-input" value={ facebook_link } onChange={(e) => setFacebook_link(e.target.value)} placeholder="Enter facebook_link..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">facebook</label>
              <div className="icon-selector-premium">
                <div className="icon-current" onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen_facebook(!isDropdownOpen_facebook);
                }}>
                  {(() => { 
                    const iconName = facebook;
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
                  <span>{ facebook || 'Select Icon' }</span>
                  <LucideIcons.ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                </div>
                {isDropdownOpen_facebook && (
                  <div id="icon_dropdown_facebook" className="icon-dropdown-grid active">
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
                            className={'icon-grid-item ' + (facebook === iconName ? 'active' : '')}
                            data-name={iconName}
                            onClick={() => {
                              setFacebook(iconName);
                              setIsDropdownOpen_facebook(false);
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
              <label className="admin-label">instagram</label>
              <div className="icon-selector-premium">
                <div className="icon-current" onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen_instagram(!isDropdownOpen_instagram);
                }}>
                  {(() => { 
                    const iconName = instagram;
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
                  <span>{ instagram || 'Select Icon' }</span>
                  <LucideIcons.ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                </div>
                {isDropdownOpen_instagram && (
                  <div id="icon_dropdown_instagram" className="icon-dropdown-grid active">
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
                            className={'icon-grid-item ' + (instagram === iconName ? 'active' : '')}
                            data-name={iconName}
                            onClick={() => {
                              setInstagram(iconName);
                              setIsDropdownOpen_instagram(false);
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
              <label className="admin-label">instagram_link</label>
              <div className="input-wrapper-premium">
                
                <input type="url"  className="admin-input" value={ instagram_link } onChange={(e) => setInstagram_link(e.target.value)} placeholder="Enter instagram_link..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">youtube</label>
              <div className="icon-selector-premium">
                <div className="icon-current" onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen_youtube(!isDropdownOpen_youtube);
                }}>
                  {(() => { 
                    const iconName = youtube;
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
                  <span>{ youtube || 'Select Icon' }</span>
                  <LucideIcons.ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                </div>
                {isDropdownOpen_youtube && (
                  <div id="icon_dropdown_youtube" className="icon-dropdown-grid active">
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
                            className={'icon-grid-item ' + (youtube === iconName ? 'active' : '')}
                            data-name={iconName}
                            onClick={() => {
                              setYoutube(iconName);
                              setIsDropdownOpen_youtube(false);
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
              <label className="admin-label">youtube_link</label>
              <div className="input-wrapper-premium">
                
                <input type="url"  className="admin-input" value={ youtube_link } onChange={(e) => setYoutube_link(e.target.value)} placeholder="Enter youtube_link..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">whatsapp</label>
              <div className="icon-selector-premium">
                <div className="icon-current" onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen_whatsapp(!isDropdownOpen_whatsapp);
                }}>
                  {(() => { 
                    const iconName = whatsapp;
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
                  <span>{ whatsapp || 'Select Icon' }</span>
                  <LucideIcons.ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                </div>
                {isDropdownOpen_whatsapp && (
                  <div id="icon_dropdown_whatsapp" className="icon-dropdown-grid active">
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
                            className={'icon-grid-item ' + (whatsapp === iconName ? 'active' : '')}
                            data-name={iconName}
                            onClick={() => {
                              setWhatsapp(iconName);
                              setIsDropdownOpen_whatsapp(false);
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
              <label className="admin-label">whatsapp_link</label>
              <div className="input-wrapper-premium">
                
                <input type="url"  className="admin-input" value={ whatsapp_link } onChange={(e) => setWhatsapp_link(e.target.value)} placeholder="Enter whatsapp_link..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">copyright</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ copyright } onChange={(e) => setCopyright(e.target.value)} placeholder="Enter copyright..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">copyright_link</label>
              <div className="input-wrapper-premium">
                
                <input type="url"  className="admin-input" value={ copyright_link } onChange={(e) => setCopyright_link(e.target.value)} placeholder="Enter copyright_link..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">privacy</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ privacy } onChange={(e) => setPrivacy(e.target.value)} placeholder="Enter privacy..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">privacy_link</label>
              <div className="input-wrapper-premium">
                
                <input type="url"  className="admin-input" value={ privacy_link } onChange={(e) => setPrivacy_link(e.target.value)} placeholder="Enter privacy_link..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">terms_</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ terms_ } onChange={(e) => setTerms_(e.target.value)} placeholder="Enter terms_..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">terms_link</label>
              <div className="input-wrapper-premium">
                
                <input type="url"  className="admin-input" value={ terms_link } onChange={(e) => setTerms_link(e.target.value)} placeholder="Enter terms_link..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">site_maps_</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ site_maps_ } onChange={(e) => setSite_maps_(e.target.value)} placeholder="Enter site_maps_..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">site_maps_link</label>
              <div className="input-wrapper-premium">
                
                <input type="url"  className="admin-input" value={ site_maps_link } onChange={(e) => setSite_maps_link(e.target.value)} placeholder="Enter site_maps_link..." />
                
              </div>
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
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowForm(false)} disabled={isSaving}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={isSaving}>
                {isSaving ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving...</>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="admin-card">
          <div style={{ marginBottom: '20px' }}>
            <div style={{ position: 'relative', maxWidth: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                className="admin-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>logo</th>
                  <th>brand_desc</th>
                  <th>facebook_link</th>
                  <th>facebook</th>
                  <th>instagram</th>
                  <th>instagram_link</th>
                  <th>youtube</th>
                  <th>youtube_link</th>
                  <th>whatsapp</th>
                  <th>whatsapp_link</th>
                  <th>copyright</th>
                  <th>copyright_link</th>
                  <th>privacy</th>
                  <th>privacy_link</th>
                  <th>terms_</th>
                  <th>terms_link</th>
                  <th>site_maps_</th>
                  <th>site_maps_link</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr>
                     <td colSpan="100%" style={{ textAlign: 'center', padding: '40px' }}>
                       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                         <Loader2 size={20} className="animate-spin" />
                         <span>Loading data...</span>
                       </div>
                     </td>
                   </tr>
                ) : filteredData.length > 0 ? filteredData.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>{item.logo ? <img src={getImageUrl(item.logo)} alt="Preview" style={{ height: '40px', borderRadius: '4px' }} /> : 'No Image'}</td>
                    <td>{String(item.brand_desc || '')}</td>
                    <td>{String(item.facebook_link || '')}</td>
                    <td>{(() => { 
                      const iconName = item.facebook;
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
                    })()}</td>
                    <td>{(() => { 
                      const iconName = item.instagram;
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
                    })()}</td>
                    <td>{String(item.instagram_link || '')}</td>
                    <td>{(() => { 
                      const iconName = item.youtube;
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
                    })()}</td>
                    <td>{String(item.youtube_link || '')}</td>
                    <td>{(() => { 
                      const iconName = item.whatsapp;
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
                    })()}</td>
                    <td>{String(item.whatsapp_link || '')}</td>
                    <td>{String(item.copyright || '')}</td>
                    <td>{String(item.copyright_link || '')}</td>
                    <td>{String(item.privacy || '')}</td>
                    <td>{String(item.privacy_link || '')}</td>
                    <td>{String(item.terms_ || '')}</td>
                    <td>{String(item.terms_link || '')}</td>
                    <td>{String(item.site_maps_ || '')}</td>
                    <td>{String(item.site_maps_link || '')}</td>
                    <td>
                      <span className={`admin-status-badge admin-status-${item.status?.toLowerCase() || 'active'}`}>
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button type="button" className="admin-action-btn" onClick={(e) => { e.stopPropagation(); openEdit(item); }} title="Edit"><Pencil size={14} /></button>
                        <button type="button" className="admin-action-btn" style={{ color: '#ef4444' }} onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="100%" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FooterManager;
