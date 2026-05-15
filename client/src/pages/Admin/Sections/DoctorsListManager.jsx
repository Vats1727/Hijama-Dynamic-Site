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

const DoctorsListManager = () => {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Form State
  const [image_, setImage_] = useState(null);
  const [image_Preview, setImage_Preview] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState([]);
  const [experience, setExperience] = useState('');
  const [patients, setPatients] = useState('');
  const [rating, setRating] = useState('');
  const [status, setStatus] = useState('Active');

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await crudService.getAll('doctors_list');
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
    if (image_ && typeof image_ === 'object') formData.append('image_', image_);
    formData.append('name', name);
    formData.append('title', title);
    formData.append('bio', bio);
    formData.append('tags', JSON.stringify(tags));
    formData.append('experience', experience);
    formData.append('patients', patients);
    formData.append('rating', rating);
    formData.append('status', status);

    try {
      if (selectedId) {
        await crudService.update('doctors_list', selectedId, formData);
        if (!isAuto) showToast('Updated successfully');
        window.dispatchEvent(new CustomEvent('api-data-updated'));
      } else {
        await crudService.create('doctors_list', formData);
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

  // Real-time heartbeat auto-save controller for practitioners 💓
  useEffect(() => {
    if (!showForm || !selectedId) return;
    const timer = setTimeout(() => {
      handleSave(null, true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [name, title, bio, tags, experience, patients, rating, status, image_]);

  const handleDelete = async (id) => {
    try {
      await crudService.delete('doctors_list', id);
      showToast('Deleted successfully');
      loadData();
    } catch (error) {
      console.error('Delete error detailed:', error);
      showToast('Failed to delete', 'error');
    }
  };

  const resetForm = () => {
    setSelectedId(null);
    setImage_(null);
    setImage_Preview('');
    setName('');
    setTitle('');
    setBio('');
    setTags([]);
    setExperience('');
    setPatients('');
    setRating('');
    setStatus('Active');
  };

  const openEdit = (item) => {
    setSelectedId(item.id);
    setImage_Preview(item.image_ ? getImageUrl(item.image_) : '');
    if (item.name !== undefined && item.name !== null) {
      setName(item.name);
    } else {
      setName('');
    }
    if (item.title !== undefined && item.title !== null) {
      setTitle(item.title);
    } else {
      setTitle('');
    }
    if (item.bio !== undefined && item.bio !== null) {
      setBio(item.bio);
    } else {
      setBio('');
    }
    if (item.tags !== undefined && item.tags !== null) {
      if (typeof item.tags === 'object') { setTags(item.tags); } 
      else { try { setTags(JSON.parse(item.tags)); } catch(e) { setTags([]); } }
    } else {
      setTags([]);
    }
    if (item.experience !== undefined && item.experience !== null) {
      setExperience(item.experience);
    } else {
      setExperience('');
    }
    if (item.patients !== undefined && item.patients !== null) {
      setPatients(item.patients);
    } else {
      setPatients('');
    }
    if (item.rating !== undefined && item.rating !== null) {
      setRating(item.rating);
    } else {
      setRating('');
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
          <h2 className="admin-card-title">Doctors List</h2>
          <p className="admin-card-subtitle">Manage your Doctors List section data here.</p>
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
              <label className="admin-label">image_</label>
              <div className="image-upload-box-premium">
                { image_Preview ? (
                  <div className="preview-wrap-premium">
                    { 'image' === 'image' ? <img src={ image_Preview } alt="Preview" /> : <div className="file-preview-placeholder"><LucideIcons.ImageIcon size={48} /><span>{ typeof image_ === 'string' ? image_ : 'File Uploaded' }</span></div> }
                    <button type="button" className="remove-img-premium" onClick={() => { setImage_(null); setImage_Preview(''); }} title="Remove">
                      <LucideIcons.XCircle size={ 22 } />
                    </button>
                  </div>
                ) : (
                  <label className="upload-placeholder-premium">
                    <LucideIcons.UploadCloud size={ 32 } />
                    <span>Click to upload image_</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if(file) { setImage_(file); setImage_Preview(URL.createObjectURL(file)); } }} />
                  </label>
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
              <label className="admin-label">title</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ title } onChange={(e) => setTitle(e.target.value)} placeholder="Enter title..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">bio</label>
              <textarea className="admin-input" rows="4" value={ bio } onChange={(e) => setBio(e.target.value)} placeholder="Enter bio..."></textarea>
            </div>
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="admin-label">tags</label>
              <div className="text-repeater">
                { Array.isArray(tags) && tags.map((val, idx) => (
                  <div key={idx} className="repeater-item">
                    <input type="text" className="admin-input" value={val} onChange={(e) => { const next = [...tags]; next[idx] = e.target.value; setTags(next); }} placeholder="Enter tags item..." />
                    <button type="button" className="repeater-remove" onClick={() => { const next = tags.filter((_, i) => i !== idx); setTags(next.length ? next : []); }}><LucideIcons.Trash2 size={14} /></button>
                  </div>
                ))}
                <button type="button" className="repeater-add" onClick={() => setTags([...(tags || []), ''])}><LucideIcons.Plus size={14} /> Add tags</button>
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">experience</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ experience } onChange={(e) => setExperience(e.target.value)} placeholder="Enter experience..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Patients</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ patients } onChange={(e) => setPatients(e.target.value)} placeholder="Enter Patients..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">rating</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ rating } onChange={(e) => setRating(e.target.value)} placeholder="Enter rating..." />
                
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
          <GlobalHeadingEditor slug="doctors_section" />
          <div className="admin-card">

          <div className="admin-vertical-card-grid">
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Loading practitioner profiles...</span>
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
                  title="Remove Doctor"
                >
                  <X size={13} strokeWidth={3} />
                </button>
                {/* Header Block */}
                <div className="admin-info-row" style={{ background: '#f8fafc', margin: '-20px -20px 16px -20px', padding: '20px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', paddingRight: '36px' }}>
                    {item.image_ ? (
                      <img src={getImageUrl(item.image_)} alt="Doctor Profile" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    ) : (
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e0f2fe', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <LucideIcons.User size={22} style={{ color: '#0284c7' }} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{item.name || 'Unnamed Provider'}</h4>
                        <span className={`admin-status-badge admin-status-${item.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                          {item.status || 'Active'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>{item.title || 'General Medicine'}</p>
                    </div>
                  </div>
                </div>

                {/* Mini Metrics Row */}
                <div className="admin-info-row" style={{ background: '#fafafa', padding: '10px', borderRadius: '8px', border: '1px dashed #e2e8f0', margin: '0 0 16px 0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', width: '100%', gap: '8px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', tracking: '0.05em', color: '#64748b', fontWeight: '600' }}>Exp</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', marginTop: '2px' }}>{item.experience || '0'} yrs</div>
                    </div>
                    <div style={{ borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', tracking: '0.05em', color: '#64748b', fontWeight: '600' }}>Clients</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', marginTop: '2px' }}>{item.patients || '0'}+</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', tracking: '0.05em', color: '#64748b', fontWeight: '600' }}>Rating</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#ca8a04', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <Star size={12} fill="currentColor" /> {item.rating || '5.0'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="admin-info-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <span className="admin-info-label" style={{ marginBottom: '4px' }}>Practitioner Biography</span>
                  <div className="admin-info-value" style={{ color: '#475569', fontSize: '13px', fontStyle: 'italic', lineHeight: '1.5' }}>
                    "{item.bio || 'No narrative entered.'}"
                  </div>
                </div>

                {/* Specialties Subgrid / Text Tags */}
                <div className="admin-info-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <span className="admin-info-label" style={{ marginBottom: '8px' }}>Focus Disciplines</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(() => {
                      let parsedTags = [];
                      try {
                        parsedTags = typeof item.tags === 'object' ? item.tags : JSON.parse(item.tags);
                      } catch (e) {
                        if (typeof item.tags === 'string') parsedTags = item.tags.split(',').map(s => s.trim());
                      }
                      
                      if (Array.isArray(parsedTags) && parsedTags.filter(Boolean).length > 0) {
                        return parsedTags.filter(Boolean).map((tag, idx) => (
                          <span key={idx} style={{ display: 'inline-block', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                            • {tag}
                          </span>
                        ));
                      }
                      return <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>No focus areas listed.</span>;
                    })()}
                  </div>
                </div>




              </div>
            )) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#fff', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                No practitioner profiles identified. Click "Add New" to add a specialist.
              </div>
            )}
          </div>

        </div>
        </>
      )}
    </div>
  );
};

export default DoctorsListManager;
