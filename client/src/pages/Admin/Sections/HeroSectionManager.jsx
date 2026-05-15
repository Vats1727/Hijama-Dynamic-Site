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

const HeroSectionManager = () => {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Form State
  const [background_image_, setBackground_image_] = useState(null);
  const [background_image_Preview, setBackground_image_Preview] = useState('');
  const [background_color_picker_, setBackground_color_picker_] = useState('');
  const [badge_text, setBadge_text] = useState('');
  const [title_line_1, setTitle_line_1] = useState('');
  const [title_line_2_italic, setTitle_line_2_italic] = useState('');
  const [description, setDescription] = useState('');
  const [primary_button, setPrimary_button] = useState('');
  const [outline_button, setOutline_button] = useState('');
  const [stat_1_num, setStat_1_num] = useState('');
  const [stat_1_label, setStat_1_label] = useState('');
  const [stat_2_num, setStat_2_num] = useState('');
  const [stat_2_label, setStat_2_label] = useState('');
  const [stat_3_num, setStat_3_num] = useState('');
  const [stat_3_label, setStat_3_label] = useState('');
  const [stat_4_num, setStat_4_num] = useState('');
  const [stat_4_label, setStat_4_label] = useState('');
  const [status, setStatus] = useState('Active');

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await crudService.getAll('hero_section');
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

    // Validation: At a time only one field is allowed to apply in backround hero section
    const hasImage = background_image_ || (background_image_Preview && background_image_Preview.length > 0);
    const hasColor = background_color_picker_ && background_color_picker_.length > 0;

    if (hasImage && hasColor && !isAuto) {
      alert('At a time, only one field is allowed to apply to the hero section background. If an image is already there, please remove the image first, or clear the color picker.');
      return;
    }

    if (!isAuto) setIsSaving(true);
    // Use FormData for robust file handling
    const formData = new FormData();
    if (background_image_ && typeof background_image_ === 'object') formData.append('background_image_', background_image_);
    formData.append('background_color_picker_', background_color_picker_);
    formData.append('badge_text', badge_text);
    formData.append('title_line_1', title_line_1);
    formData.append('title_line_2_italic', title_line_2_italic);
    formData.append('description', description);
    formData.append('primary_button', JSON.stringify(primary_button));
    formData.append('outline_button', JSON.stringify(outline_button));
    formData.append('stat_1_num', stat_1_num);
    formData.append('stat_1_label', stat_1_label);
    formData.append('stat_2_num', stat_2_num);
    formData.append('stat_2_label', stat_2_label);
    formData.append('stat_3_num', stat_3_num);
    formData.append('stat_3_label', stat_3_label);
    formData.append('stat_4_num', stat_4_num);
    formData.append('stat_4_label', stat_4_label);
    formData.append('status', status);

    try {
      if (selectedId) {
        await crudService.update('hero_section', selectedId, formData);
        if (!isAuto) showToast('Updated successfully');
        // Real-time visual hot reload for iframe layouts!
        window.dispatchEvent(new CustomEvent('api-data-updated'));
      } else {
        await crudService.create('hero_section', formData);
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

  // Premium real-time heart beat auto-saver for Hero Section 💓
  useEffect(() => {
    if (!showForm || !selectedId) return;
    const timer = setTimeout(() => {
      handleSave(null, true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [
    background_color_picker_, badge_text, title_line_1, title_line_2_italic,
    description, primary_button, outline_button, status, background_image_,
    stat_1_num, stat_1_label, stat_2_num, stat_2_label, stat_3_num, stat_3_label, stat_4_num, stat_4_label
  ]);

  const handleDelete = async (id) => {
    try {
      await crudService.delete('hero_section', id);
      showToast('Deleted successfully');
      loadData();
    } catch (error) {
      console.error('Delete error detailed:', error);
      showToast('Failed to delete', 'error');
    }
  };

  const handleRemoveImage = async () => {
    if (selectedId && background_image_Preview && !background_image_) {
      try {
        await api.post(`/hero_section/${selectedId}/remove-image`);
        showToast('Image permanently deleted from the server');
        loadData();
      } catch (err) {
        console.error('Failed to permanently delete image:', err);
        showToast('Failed to delete image from the server', 'error');
      }
    }
    setBackground_image_(null);
    setBackground_image_Preview('');
  };

  const resetForm = () => {
    setSelectedId(null);
    setBackground_image_(null);
    setBackground_image_Preview('');
    setBackground_color_picker_('');
    setBadge_text('');
    setTitle_line_1('');
    setTitle_line_2_italic('');
    setDescription('');
    setPrimary_button('');
    setOutline_button('');
    setStat_1_num('');
    setStat_1_label('');
    setStat_2_num('');
    setStat_2_label('');
    setStat_3_num('');
    setStat_3_label('');
    setStat_4_num('');
    setStat_4_label('');
    setStatus('Active');
  };

  const openEdit = (item) => {
    setSelectedId(item.id);
    setBackground_image_Preview(item.background_image_ ? getImageUrl(item.background_image_) : '');
    if (item.background_color_picker_ !== undefined && item.background_color_picker_ !== null) {
      setBackground_color_picker_(item.background_color_picker_);
    } else {
      setBackground_color_picker_('');
    }
    if (item.badge_text !== undefined && item.badge_text !== null) {
      setBadge_text(item.badge_text);
    } else {
      setBadge_text('');
    }
    if (item.title_line_1 !== undefined && item.title_line_1 !== null) {
      setTitle_line_1(item.title_line_1);
    } else {
      setTitle_line_1('');
    }
    if (item.title_line_2_italic !== undefined && item.title_line_2_italic !== null) {
      setTitle_line_2_italic(item.title_line_2_italic);
    } else {
      setTitle_line_2_italic('');
    }
    if (item.description !== undefined && item.description !== null) {
      setDescription(item.description);
    } else {
      setDescription('');
    }
    if (item.primary_button !== undefined && item.primary_button !== null) {
      if (typeof item.primary_button === 'object') { setPrimary_button(item.primary_button); } 
      else { try { setPrimary_button(JSON.parse(item.primary_button)); } catch(e) { setPrimary_button(''); } }
    } else {
      setPrimary_button('');
    }
    if (item.outline_button !== undefined && item.outline_button !== null) {
      if (typeof item.outline_button === 'object') { setOutline_button(item.outline_button); } 
      else { try { setOutline_button(JSON.parse(item.outline_button)); } catch(e) { setOutline_button(''); } }
    } else {
      setOutline_button('');
    }
    if (item.stat_1_num !== undefined && item.stat_1_num !== null) {
      setStat_1_num(item.stat_1_num);
    } else {
      setStat_1_num('');
    }
    if (item.stat_1_label !== undefined && item.stat_1_label !== null) {
      setStat_1_label(item.stat_1_label);
    } else {
      setStat_1_label('');
    }
    if (item.stat_2_num !== undefined && item.stat_2_num !== null) {
      setStat_2_num(item.stat_2_num);
    } else {
      setStat_2_num('');
    }
    if (item.stat_2_label !== undefined && item.stat_2_label !== null) {
      setStat_2_label(item.stat_2_label);
    } else {
      setStat_2_label('');
    }
    if (item.stat_3_num !== undefined && item.stat_3_num !== null) {
      setStat_3_num(item.stat_3_num);
    } else {
      setStat_3_num('');
    }
    if (item.stat_3_label !== undefined && item.stat_3_label !== null) {
      setStat_3_label(item.stat_3_label);
    } else {
      setStat_3_label('');
    }
    if (item.stat_4_num !== undefined && item.stat_4_num !== null) {
      setStat_4_num(item.stat_4_num);
    } else {
      setStat_4_num('');
    }
    if (item.stat_4_label !== undefined && item.stat_4_label !== null) {
      setStat_4_label(item.stat_4_label);
    } else {
      setStat_4_label('');
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
          <h2 className="admin-card-title">Hero Section</h2>
          <p className="admin-card-subtitle">Manage your Hero Section section data here.</p>
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
              <label className="admin-label">background_image_</label>
              <div className="image-upload-box-premium">
                { background_image_Preview ? (
                  <div className="preview-wrap-premium">
                    { 'image' === 'image' ? <img src={ background_image_Preview } alt="Preview" /> : <div className="file-preview-placeholder"><LucideIcons.ImageIcon size={48} /><span>{ typeof background_image_ === 'string' ? background_image_ : 'File Uploaded' }</span></div> }
                    <button type="button" className="remove-img-premium" onClick={handleRemoveImage} title="Remove">
                      <LucideIcons.XCircle size={ 22 } />
                    </button>
                  </div>
                ) : (
                  <label className="upload-placeholder-premium">
                    <LucideIcons.UploadCloud size={ 32 } />
                    <span>Click to upload background_image_</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if(file) { setBackground_image_(file); setBackground_image_Preview(URL.createObjectURL(file)); } }} />
                  </label>
                )}
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Background Color Picker</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="color" 
                  style={{
                    width: '50px',
                    height: '42px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '2px',
                    cursor: 'pointer',
                    background: '#fff'
                  }} 
                  value={background_color_picker_ || '#ffffff'} 
                  onChange={(e) => setBackground_color_picker_(e.target.value)} 
                />
                <input 
                  type="text" 
                  className="admin-input" 
                  style={{ flex: 1, height: '42px' }}
                  value={background_color_picker_ || ''} 
                  onChange={(e) => setBackground_color_picker_(e.target.value)} 
                  placeholder="Select color or enter hex like #112233" 
                />
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">badge_text</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ badge_text } onChange={(e) => setBadge_text(e.target.value)} placeholder="Enter badge_text..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">title_line_1</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ title_line_1 } onChange={(e) => setTitle_line_1(e.target.value)} placeholder="Enter title_line_1..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">title_line_2_italic</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ title_line_2_italic } onChange={(e) => setTitle_line_2_italic(e.target.value)} placeholder="Enter title_line_2_italic..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">description</label>
              <textarea className="admin-input" rows="4" value={ description } onChange={(e) => setDescription(e.target.value)} placeholder="Enter description..."></textarea>
            </div>
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="admin-label">primary_button</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <input type="text" className="admin-input" value={ primary_button?.label || '' } onChange={(e) => setPrimary_button({ ...primary_button, label: e.target.value })} placeholder="Button Label (e.g. Learn More)" />
                <input type="text" className="admin-input" value={ primary_button?.url || '' } onChange={(e) => setPrimary_button({ ...primary_button, url: e.target.value })} placeholder="Link URL (e.g. https://...)" />
              </div>
            </div>
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="admin-label">outline_button</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <input type="text" className="admin-input" value={ outline_button?.label || '' } onChange={(e) => setOutline_button({ ...outline_button, label: e.target.value })} placeholder="Button Label (e.g. Learn More)" />
                <input type="text" className="admin-input" value={ outline_button?.url || '' } onChange={(e) => setOutline_button({ ...outline_button, url: e.target.value })} placeholder="Link URL (e.g. https://...)" />
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">stat_1_num</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ stat_1_num } onChange={(e) => setStat_1_num(e.target.value)} placeholder="Enter stat_1_num..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">stat_1_label</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ stat_1_label } onChange={(e) => setStat_1_label(e.target.value)} placeholder="Enter stat_1_label..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">stat_2_num</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ stat_2_num } onChange={(e) => setStat_2_num(e.target.value)} placeholder="Enter stat_2_num..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">stat_2_label</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ stat_2_label } onChange={(e) => setStat_2_label(e.target.value)} placeholder="Enter stat_2_label..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">stat_3_num</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ stat_3_num } onChange={(e) => setStat_3_num(e.target.value)} placeholder="Enter stat_3_num..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">stat_3_label</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ stat_3_label } onChange={(e) => setStat_3_label(e.target.value)} placeholder="Enter stat_3_label..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">stat_4_num</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ stat_4_num } onChange={(e) => setStat_4_num(e.target.value)} placeholder="Enter stat_4_num..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">stat_4_label</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ stat_4_label } onChange={(e) => setStat_4_label(e.target.value)} placeholder="Enter stat_4_label..." />
                
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
          <div className="admin-vertical-card-grid">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', color: '#64748b', gridColumn: '1/-1' }}>
                <Loader2 size={24} className="animate-spin" style={{ marginRight: '10px' }} />
                <span>Loading Hero configuration...</span>
              </div>
            ) : filteredData.length > 0 ? filteredData.map((item, idx) => (
              <div className="admin-info-card clickable-setup-card" key={item.id} onClick={() => openEdit(item)} style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}>
                <div className="admin-info-row">
                  <span className="admin-info-label">Hero Visuals</span>
                  <div className="admin-info-value">
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: item.background_color_picker_ || '#fff', border: '1px solid #cbd5e1' }} title={`BG Color: ${item.background_color_picker_ || '-'}`} />
                      {item.background_image_ ? (
                        <img src={getImageUrl(item.background_image_)} alt="BG" className="admin-card-thumb" style={{ width: '80px', height: '45px' }} />
                      ) : <span style={{ fontSize: '12px', color: '#94a3b8' }}>No Image</span>}
                    </div>
                  </div>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">Badge & Title</span>
                  <div className="admin-info-value" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    {item.badge_text && <span style={{ fontSize: '11px', fontWeight: '600', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', marginBottom: '4px' }}>{item.badge_text}</span>}
                    <strong style={{ fontWeight: '600' }}>{item.title_line_1 || '-'}</strong>
                    {item.title_line_2_italic && <em style={{ color: '#64748b', fontSize: '13px' }}>{item.title_line_2_italic}</em>}
                  </div>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">Description</span>
                  <div className="admin-info-value" style={{ fontSize: '13px', fontStyle: 'italic', color: '#475569' }}>
                    {item.description ? (item.description.length > 60 ? item.description.substring(0, 60) + '...' : item.description) : '-'}
                  </div>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">Action Buttons</span>
                  <div className="admin-info-value" style={{ gap: '8px' }}>
                    {(() => { 
                      try { 
                        const p = typeof item.primary_button === 'string' ? JSON.parse(item.primary_button) : item.primary_button; 
                        const o = typeof item.outline_button === 'string' ? JSON.parse(item.outline_button) : item.outline_button; 
                        return (
                          <>
                            {p ? <span style={{ fontSize: '12px', background: '#4f46e5', color: '#fff', padding: '3px 8px', borderRadius: '6px' }}>{p.label || 'Primary'}</span> : null}
                            {o ? <span style={{ fontSize: '12px', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px' }}>{o.label || 'Outline'}</span> : null}
                            {!p && !o ? '-' : null}
                          </>
                        );
                      } catch(e) { return '-'; } 
                    })()}
                  </div>
                </div>
                <div className="admin-info-row" style={{ backgroundColor: '#fafafa' }}>
                  <span className="admin-info-label">Active Stats</span>
                  <div className="admin-info-value" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '6px 12px', textAlign: 'left' }}>
                    <div style={{ fontSize: '12px' }}><strong>{item.stat_1_num || '0'}</strong> <span style={{ color: '#64748b' }}>{item.stat_1_label}</span></div>
                    <div style={{ fontSize: '12px' }}><strong>{item.stat_2_num || '0'}</strong> <span style={{ color: '#64748b' }}>{item.stat_2_label}</span></div>
                    <div style={{ fontSize: '12px' }}><strong>{item.stat_3_num || '0'}</strong> <span style={{ color: '#64748b' }}>{item.stat_3_label}</span></div>
                    <div style={{ fontSize: '12px' }}><strong>{item.stat_4_num || '0'}</strong> <span style={{ color: '#64748b' }}>{item.stat_4_label}</span></div>
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
                No Hero configurations loaded yet.
              </div>
            )}
          </div>
      )}
    </div>
  );
};

export default HeroSectionManager;
