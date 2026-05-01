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

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    // Validation: At a time only one field is allowed to apply in backround hero section
    const hasImage = background_image_ || (background_image_Preview && background_image_Preview.length > 0);
    const hasColor = background_color_picker_ && background_color_picker_.length > 0;

    if (hasImage && hasColor) {
      alert('At a time, only one field is allowed to apply to the hero section background. If an image is already there, please remove the image first, or clear the color picker.');
      return;
    }

    setIsSaving(true);
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
        showToast('Updated successfully');
      } else {
        await crudService.create('hero_section', formData);
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
                  <th>background_image_</th>
                  <th>Background Color Picker </th>
                  <th>badge_text</th>
                  <th>title_line_1</th>
                  <th>title_line_2_italic</th>
                  <th>description</th>
                  <th>primary_button</th>
                  <th>outline_button</th>
                  <th>stat_1_num</th>
                  <th>stat_1_label</th>
                  <th>stat_2_num</th>
                  <th>stat_2_label</th>
                  <th>stat_3_num</th>
                  <th>stat_3_label</th>
                  <th>stat_4_num</th>
                  <th>stat_4_label</th>
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
                    <td>{item.background_image_ ? <img src={getImageUrl(item.background_image_)} alt="Preview" style={{ height: '40px', borderRadius: '4px' }} /> : 'No Image'}</td>
                    <td>{String(item.background_color_picker_ || '')}</td>
                    <td>{String(item.badge_text || '')}</td>
                    <td>{String(item.title_line_1 || '')}</td>
                    <td>{String(item.title_line_2_italic || '')}</td>
                    <td>{String(item.description || '')}</td>
                    <td>{(() => { try { const link = typeof item.primary_button === 'string' ? JSON.parse(item.primary_button) : item.primary_button; return link ? <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{link.label || 'Link'}</a> : 'No Link'; } catch(e) { return 'Invalid Link'; } })()}</td>
                    <td>{(() => { try { const link = typeof item.outline_button === 'string' ? JSON.parse(item.outline_button) : item.outline_button; return link ? <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{link.label || 'Link'}</a> : 'No Link'; } catch(e) { return 'Invalid Link'; } })()}</td>
                    <td>{String(item.stat_1_num || '')}</td>
                    <td>{String(item.stat_1_label || '')}</td>
                    <td>{String(item.stat_2_num || '')}</td>
                    <td>{String(item.stat_2_label || '')}</td>
                    <td>{String(item.stat_3_num || '')}</td>
                    <td>{String(item.stat_3_label || '')}</td>
                    <td>{String(item.stat_4_num || '')}</td>
                    <td>{String(item.stat_4_label || '')}</td>
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

export default HeroSectionManager;
