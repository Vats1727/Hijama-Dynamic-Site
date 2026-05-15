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

const Testimonials_ListManager = () => {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Form State
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('');
  const [profile_image_, setProfile_image_] = useState(null);
  const [profile_image_Preview, setProfile_image_Preview] = useState('');
  const [status, setStatus] = useState('Active');

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await crudService.getAll('testimonials_list');
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
    formData.append('stars', stars);
    formData.append('text', text);
    formData.append('author', author);
    formData.append('role', role);
    if (profile_image_ && typeof profile_image_ === 'object') formData.append('profile_image_', profile_image_);
    formData.append('status', status);

    try {
      if (selectedId) {
        await crudService.update('testimonials_list', selectedId, formData);
        if (!isAuto) showToast('Updated successfully');
        window.dispatchEvent(new CustomEvent('api-data-updated'));
      } else {
        await crudService.create('testimonials_list', formData);
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

  // Debounce auto-save tracking heartbeat for testimonials list 💓
  useEffect(() => {
    if (!showForm || !selectedId) return;
    const timer = setTimeout(() => {
      handleSave(null, true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [stars, text, author, role, status, profile_image_]);

  const handleDelete = async (id) => {
    try {
      await crudService.delete('testimonials_list', id);
      showToast('Deleted successfully');
      loadData();
    } catch (error) {
      console.error('Delete error detailed:', error);
      showToast('Failed to delete', 'error');
    }
  };

  const resetForm = () => {
    setSelectedId(null);
    setStars(5);
    setText('');
    setAuthor('');
    setRole('');
    setProfile_image_(null);
    setProfile_image_Preview('');
    setStatus('Active');
  };

  const openEdit = (item) => {
    setSelectedId(item.id);
    if (item.stars !== undefined && item.stars !== null) {
      setStars(item.stars);
    } else {
      setStars(5);
    }
    if (item.text !== undefined && item.text !== null) {
      setText(item.text);
    } else {
      setText('');
    }
    if (item.author !== undefined && item.author !== null) {
      setAuthor(item.author);
    } else {
      setAuthor('');
    }
    if (item.role !== undefined && item.role !== null) {
      setRole(item.role);
    } else {
      setRole('');
    }
    setProfile_image_Preview(item.profile_image_ ? getImageUrl(item.profile_image_) : '');
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
          <h2 className="admin-card-title">Testimonials_List </h2>
          <p className="admin-card-subtitle">Manage your Testimonials_List  section data here.</p>
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
              <label className="admin-label">stars</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStars(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}
                  >
                    <LucideIcons.Star
                      size={ 28 }
                      fill={ star <= stars ? '#facc15' : 'transparent' }
                      color={ star <= stars ? '#facc15' : '#cbd5e1' }
                      style={{ transition: '0.2s' }}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">text</label>
              <textarea className="admin-input" rows="4" value={ text } onChange={(e) => setText(e.target.value)} placeholder="Enter text..."></textarea>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">author</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ author } onChange={(e) => setAuthor(e.target.value)} placeholder="Enter author..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">role</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ role } onChange={(e) => setRole(e.target.value)} placeholder="Enter role..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">profile_image_</label>
              <div className="image-upload-box-premium">
                { profile_image_Preview ? (
                  <div className="preview-wrap-premium">
                    { 'image' === 'image' ? <img src={ profile_image_Preview } alt="Preview" /> : <div className="file-preview-placeholder"><LucideIcons.ImageIcon size={48} /><span>{ typeof profile_image_ === 'string' ? profile_image_ : 'File Uploaded' }</span></div> }
                    <button type="button" className="remove-img-premium" onClick={() => { setProfile_image_(null); setProfile_image_Preview(''); }} title="Remove">
                      <LucideIcons.XCircle size={ 22 } />
                    </button>
                  </div>
                ) : (
                  <label className="upload-placeholder-premium">
                    <LucideIcons.UploadCloud size={ 32 } />
                    <span>Click to upload profile_image_</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if(file) { setProfile_image_(file); setProfile_image_Preview(URL.createObjectURL(file)); } }} />
                  </label>
                )}
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
        <>
          <GlobalHeadingEditor slug="testimonial_section" />
          <div className="admin-card">

          <div className="admin-vertical-card-grid">
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Loading testimonials...</span>
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
                    zIndex: '10',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#ef4444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  title="Delete Review"
                >
                  <X size={13} strokeWidth={3} />
                </button>
                
                {/* Quote Block */}
                <div className="admin-info-row" style={{ flexDirection: 'column', alignItems: 'stretch', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingRight: '36px' }}>
                    {/* Render dynamic Star row with rating scale */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((starNum) => (
                          <Star 
                            key={starNum} 
                            size={13} 
                            fill={starNum <= (Number(item.stars) || 5) ? '#facc15' : 'transparent'} 
                            color={starNum <= (Number(item.stars) || 5) ? '#facc15' : '#cbd5e1'} 
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '750' }}>{item.stars || 5}/5</span>
                    </div>
                    <span className={`admin-status-badge admin-status-${item.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                      {item.status || 'Active'}
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontStyle: 'italic', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '4px', left: '8px', fontSize: '48px', fontFamily: 'serif', color: '#cbd5e1', lineHeight: 1, pointerEvents: 'none' }}>“</span>
                    <p style={{ margin: 0, color: '#334155', fontSize: '13.5px', lineHeight: '1.6', textIndent: '14px', position: 'relative', zIndex: 1 }}>
                      {item.text || 'No feedback transcript written.'}
                    </p>
                  </div>
                </div>

                {/* Author Meta Info */}
                <div className="admin-info-row" style={{ background: '#fafafa', margin: '0 -20px 16px -20px', padding: '12px 20px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.profile_image_ ? (
                      <img src={getImageUrl(item.profile_image_)} alt="Author profile" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} />
                    ) : (
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                        <LucideIcons.User size={18} style={{ color: '#94a3b8' }} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{item.author || 'Anonymous'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>{item.role || 'Patient'}</div>
                    </div>
                  </div>
                </div>





              </div>
            )) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#fff', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                No testimonials found. Click "Add New" to start building social proof.
              </div>
            )}
          </div>

        </div>
        </>
      )}
    </div>
  );
};

export default Testimonials_ListManager;
