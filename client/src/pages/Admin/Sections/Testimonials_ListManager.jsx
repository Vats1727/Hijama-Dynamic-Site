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

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    // Validation


    setIsSaving(true);
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
        showToast('Updated successfully');
      } else {
        await crudService.create('testimonials_list', formData);
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
                  <th>stars</th>
                  <th>text</th>
                  <th>author</th>
                  <th>role</th>
                  <th>profile_image_</th>
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
                    <td>{String(item.stars || '')}</td>
                    <td>{String(item.text || '')}</td>
                    <td>{String(item.author || '')}</td>
                    <td>{String(item.role || '')}</td>
                    <td>{item.profile_image_ ? <img src={getImageUrl(item.profile_image_)} alt="Preview" style={{ height: '40px', borderRadius: '4px' }} /> : 'No Image'}</td>
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

export default Testimonials_ListManager;
