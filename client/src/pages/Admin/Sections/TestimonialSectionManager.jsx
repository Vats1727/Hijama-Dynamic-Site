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

const TestimonialSectionManager = () => {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Form State
  const [tag, setTag] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Active');

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await crudService.getAll('testimonial_section');
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
    formData.append('tag', tag);
    formData.append('title', title);
    formData.append('status', status);

    try {
      if (selectedId) {
        await crudService.update('testimonial_section', selectedId, formData);
        showToast('Updated successfully');
      } else {
        await crudService.create('testimonial_section', formData);
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
      await crudService.delete('testimonial_section', id);
      showToast('Deleted successfully');
      loadData();
    } catch (error) {
      console.error('Delete error detailed:', error);
      showToast('Failed to delete', 'error');
    }
  };

  const resetForm = () => {
    setSelectedId(null);
    setTag('');
    setTitle('');
    setStatus('Active');
  };

  const openEdit = (item) => {
    setSelectedId(item.id);
    if (item.tag !== undefined && item.tag !== null) {
      setTag(item.tag);
    } else {
      setTag('');
    }
    if (item.title !== undefined && item.title !== null) {
      setTitle(item.title);
    } else {
      setTitle('');
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
          <h2 className="admin-card-title">Testimonial Section </h2>
          <p className="admin-card-subtitle">Manage your Testimonial Section  section data here.</p>
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
              <label className="admin-label">tag</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ tag } onChange={(e) => setTag(e.target.value)} placeholder="Enter tag..." />
                
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">title</label>
              <div className="input-wrapper-premium">
                
                <input type="text"  className="admin-input" value={ title } onChange={(e) => setTitle(e.target.value)} placeholder="Enter title..." />
                
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
                  <th>tag</th>
                  <th>title</th>
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
                    <td>{String(item.tag || '')}</td>
                    <td>{String(item.title || '')}</td>
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

export default TestimonialSectionManager;
