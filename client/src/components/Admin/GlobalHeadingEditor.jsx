import React, { useState, useEffect } from 'react';
import { Settings, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { crudService } from '../../services/crud';
import { useToast } from './ToastContext';

const GlobalHeadingEditor = ({ slug, fieldMap = {} }) => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [id, setId] = useState(null);
  const [tag, setTag] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  // Formulate safety-first configuration mapping to prevent undefined property overrides when partial objects are passed!
  const effectiveFieldMap = {
    tag: 'tag',
    title: 'title',
    desc: 'desc',
    ...fieldMap
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await crudService.getAll(slug);
      const rows = Array.isArray(result) ? result : [];
      // For section-specific tables, we take the first available active row, or fall back to the absolute first row
      const activeItem = rows.find(r => r.status === 'Active') || rows[0];
      
      if (activeItem) {
        setId(activeItem.id);
        setTag(activeItem[effectiveFieldMap.tag] || '');
        setTitle(activeItem[effectiveFieldMap.title] || '');
        setDesc(activeItem[effectiveFieldMap.desc] || '');
      } else {
        setId(null);
        setTag('');
        setTitle('');
        setDesc('');
      }
    } catch (error) {
      console.error(`Failed to load global heading data for slug: ${slug}`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, slug]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Build highly targeted payload to prevent over-writing adjacent properties
    const payload = {
      [effectiveFieldMap.tag]: tag,
      [effectiveFieldMap.title]: title,
      [effectiveFieldMap.desc]: desc
    };

    try {
      if (id) {
        await crudService.update(slug, id, payload);
        showToast('Global heading details saved successfully');
      } else {
        // Include baseline status if creating a pristine root configuration
        payload.status = 'Active';
        await crudService.create(slug, payload);
        showToast('New global heading record initialized successfully');
      }
      setIsOpen(false);
      // Broadcast API update signals so both layout iframes and sub-components refresh in lockstep!
      window.dispatchEvent(new CustomEvent('global-heading-updated', { detail: { slug } }));
      window.dispatchEvent(new CustomEvent('api-data-updated'));
    } catch (error) {
      console.error('Failed to commit global heading changes:', error);
      showToast('Failed to save heading details', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="global-heading-editor-wrapper" style={{ marginBottom: '24px', width: '100%' }}>
      <button 
        type="button" 
        className={`admin-btn ${isOpen ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontWeight: '700',
          padding: '10px 20px',
          borderRadius: '8px',
          boxShadow: isOpen ? '0 4px 12px rgba(79, 70, 229, 0.2)' : '0 2px 4px rgba(0,0,0,0.03)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Settings size={16} className={isOpen ? 'animate-spin' : ''} style={{ animationDuration: '4s' }} />
        <span>Global Heading</span>
        {isOpen ? <ChevronUp size={14} style={{ marginLeft: '4px' }} /> : <ChevronDown size={14} style={{ marginLeft: '4px' }} />}
      </button>

      {isOpen && (
        <div 
          className="admin-card" 
          style={{ 
            marginTop: '14px', 
            padding: '20px',
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
            animation: 'slideDownPremium 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px', gap: '10px', color: '#64748b' }}>
              <Loader2 size={20} className="animate-spin" />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Fetching dynamic header records...</span>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <h4 style={{ margin: '0 0 18px 0', color: '#0f172a', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <span style={{ background: '#e0e7ff', color: '#4f46e5', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✎</span>
                Modify Global Intro Text & Section Context
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div className="admin-form-group" style={{ margin: 0 }}>
                  <label className="admin-label" style={{ fontSize: '12px', marginBottom: '6px', color: '#475569' }}>Section Tag / Badge Text</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    style={{ padding: '10px 14px', fontSize: '13px', height: '42px' }}
                    placeholder="e.g., OUR EXPERTS or WHY CHOOSE US" 
                    value={tag} 
                    onChange={e => setTag(e.target.value)} 
                  />
                </div>
                <div className="admin-form-group" style={{ margin: 0 }}>
                  <label className="admin-label" style={{ fontSize: '12px', marginBottom: '6px', color: '#475569' }}>Main Heading Title</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    style={{ padding: '10px 14px', fontSize: '13px', height: '42px' }}
                    placeholder="Enter the prominent title..." 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                  />
                </div>
                <div className="admin-form-group" style={{ margin: 0 }}>
                  <label className="admin-label" style={{ fontSize: '12px', marginBottom: '6px', color: '#475569' }}>Supporting Description</label>
                  <textarea 
                    className="admin-input" 
                    style={{ padding: '10px 14px', fontSize: '13px', minHeight: '75px', maxHeight: '150px', resize: 'vertical' }}
                    placeholder="Write a compelling introductory paragraph to set the context..." 
                    value={desc} 
                    onChange={e => setDesc(e.target.value)} 
                    rows={3}
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary" 
                  style={{ padding: '8px 16px', fontSize: '12px', height: 'auto' }}
                  onClick={() => setIsOpen(false)}
                >
                  Dismiss
                </button>
                <button 
                  type="submit" 
                  className="admin-btn admin-btn-primary" 
                  style={{ padding: '8px 18px', fontSize: '12px', height: 'auto', gap: '6px' }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <><Loader2 size={14} className="animate-spin" /> Synchronizing...</>
                  ) : 'Save Header Info'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalHeadingEditor;
