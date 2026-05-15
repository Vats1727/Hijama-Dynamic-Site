import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import { crudService } from '../../../services/crud';
import { useToast } from '../../../components/Admin/ToastContext';
import GlobalHeadingEditor from '../../../components/Admin/GlobalHeadingEditor';

const BookYourAppointmentManager = () => {
  const { showToast } = useToast();
  
  // Section Configuration State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [get_in_touch_label_, setGet_in_touch_label_] = useState('');
  const [section_title_, setSection_title_] = useState('');
  const [section_description, setSection_description] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [phone_2, setPhone_2] = useState('');
  const [phone_icon, setPhone_icon] = useState('');
  const [email, setEmail] = useState('');
  const [email_2, setEmail_2] = useState('');
  const [email_icon_, setEmail_icon_] = useState('');
  const [clinic_hours, setClinic_hours] = useState('');
  const [clinic_hours_icon, setClinic_hours_icon] = useState('');
  const [_sunnah_dates__this_month_, set_sunnah_dates__this_month_] = useState('');
  const [sunnah_dates__this_month_, setSunnah_dates__this_month_] = useState('');
  const [status, setStatus] = useState('Active');

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await crudService.getAll('book_your_appointment');
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Failed to fetch section data:', error);
      showToast('Error loading section data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.icon-dropdown-grid') && !e.target.closest('.admin-icon-selector-trigger')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Save Handler
  const handleSaveSection = async (e = null, isAuto = false) => {
    if (e) e.preventDefault();
    if (isSaving && !isAuto) return;
    if (!isAuto) setIsSaving(true);

    const formData = {
      get_in_touch_label_,
      section_title_,
      section_description,
      address,
      location,
      phone,
      phone_2,
      phone_icon,
      email,
      email_2,
      email_icon_,
      clinic_hours,
      clinic_hours_icon,
      _sunnah_dates__this_month_,
      sunnah_dates__this_month_,
      status
    };

    try {
      if (selectedId) {
        await crudService.update('book_your_appointment', selectedId, formData);
        if (!isAuto) showToast('Updated successfully');
        // Refresh parent wrapper for real-time preview propagation!
        window.dispatchEvent(new CustomEvent('api-data-updated'));
      } else {
        await crudService.create('book_your_appointment', formData);
        if (!isAuto) showToast('Created successfully');
      }
      if (!isAuto) {
        setShowForm(false);
        resetSectionForm();
      }
      loadData();
    } catch (error) {
      if (!isAuto) {
        console.error('Save error:', error);
        showToast('Failed to save section info', 'error');
      }
    } finally {
      if (!isAuto) setIsSaving(false);
    }
  };

  // Real-time auto-sync tracker debounce heart 💓
  useEffect(() => {
    if (!showForm || !selectedId) return;
    const timer = setTimeout(() => {
      handleSaveSection(null, true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [
    address, location, phone, phone_2, phone_icon, email,
    email_2, email_icon_, clinic_hours, clinic_hours_icon,
    _sunnah_dates__this_month_, sunnah_dates__this_month_, status
  ]);

  const resetSectionForm = () => {
    setSelectedId(null);
    setGet_in_touch_label_('');
    setSection_title_('');
    setSection_description('');
    setAddress('');
    setLocation('');
    setPhone('');
    setPhone_2('');
    setPhone_icon('');
    setEmail('');
    setEmail_2('');
    setEmail_icon_('');
    setClinic_hours('');
    setClinic_hours_icon('');
    set_sunnah_dates__this_month_('');
    setSunnah_dates__this_month_('');
    setStatus('Active');
  };

  const openSectionEdit = (item) => {
    setSelectedId(item.id);
    setGet_in_touch_label_(item.get_in_touch_label_ || '');
    setSection_title_(item.section_title_ || '');
    setSection_description(item.section_description || '');
    setAddress(item.address || '');
    setLocation(item.location || '');
    setPhone(item.phone || '');
    setPhone_2(item.phone_2 || '');
    setPhone_icon(item.phone_icon || '');
    setEmail(item.email || '');
    setEmail_2(item.email_2 || '');
    setEmail_icon_(item.email_icon_ || '');
    setClinic_hours(item.clinic_hours || '');
    setClinic_hours_icon(item.clinic_hours_icon || '');
    set_sunnah_dates__this_month_(item._sunnah_dates__this_month_ || '');
    setSunnah_dates__this_month_(item.sunnah_dates__this_month_ || '');
    setStatus(item.status || 'Active');
    setShowForm(true);
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section record?')) return;
    try {
      await crudService.delete('book_your_appointment', id);
      showToast('Deleted successfully');
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete section info', 'error');
    }
  };

  const renderIconSelector = (label, value, setter, fieldKey) => {
    const IconComponent = (value && value !== 'Icon' && LucideIcons[value]) ? LucideIcons[value] : LucideIcons.HelpCircle;
    
    return (
      <div className="admin-form-group" style={{ position: 'relative' }}>
        <label className="admin-label">{label}</label>
        <div 
          className="admin-input admin-icon-selector-trigger" 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: '#f8fafc' }}
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdown(activeDropdown === fieldKey ? null : fieldKey);
          }}
        >
          <div style={{ padding: '6px', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex' }}>
            {React.createElement(IconComponent, { size: 16, color: '#6366f1' })}
          </div>
          <span>{value || 'Select Icon'}</span>
          <LucideIcons.ChevronDown size={14} style={{ marginLeft: 'auto' }} />
        </div>

        {activeDropdown === fieldKey && (
          <div className="icon-dropdown-grid active" style={{ top: '100%', marginTop: '8px', zIndex: 100 }}>
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
            <div className="icon-grid-scroll" style={{ maxHeight: '200px' }}>
              {Object.keys(LucideIcons)
                .filter(key => /^[A-Z]/.test(key) && key !== 'Icon' && key !== 'Lucide' && (typeof LucideIcons[key] === 'function' || typeof LucideIcons[key] === 'object'))
                .map(iconName => {
                  return (
                    <div 
                      key={iconName} 
                      className={'icon-grid-item ' + (value === iconName ? 'active' : '')}
                      data-name={iconName}
                      onClick={(e) => {
                        e.stopPropagation();
                        setter(iconName);
                        setActiveDropdown(null);
                      }}
                    >
                      {React.createElement(LucideIcons[iconName], { size: 16 })}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-section">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Contact Us</h2>
          <p className="admin-card-subtitle">Manage Contact Us Section Layout and Configurations</p>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>Contact Configuration</h3>
          {!showForm && data.length === 0 && (
            <button className="admin-btn admin-btn-primary" onClick={() => { resetSectionForm(); setShowForm(true); }}>
              <PlusCircle size={16} /> Add Configuration
            </button>
          )}
        </div>
        
        <GlobalHeadingEditor 
          slug="book_your_appointment" 
          fieldMap={{ tag: 'get_in_touch_label_', title: 'section_title_', desc: 'section_description' }} 
        />

        {showForm ? (
          <div className="admin-card">
            <form onSubmit={handleSaveSection}>
              <div className="admin-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="admin-form-group">
                  <label className="admin-label">Address</label>
                  <textarea className="admin-input" rows="3" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Clinic complete mailing address"></textarea>
                </div>
                {renderIconSelector("Location Icon", location, setLocation, "location")}
                <div className="admin-form-group">
                  <label className="admin-label">Primary Phone</label>
                  <input type="text" className="admin-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Primary Contact No." />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Secondary Phone</label>
                  <input type="text" className="admin-input" value={phone_2} onChange={(e) => setPhone_2(e.target.value)} placeholder="Backup Contact No." />
                </div>
                {renderIconSelector("Phone Icon", phone_icon, setPhone_icon, "phone_icon")}
                <div className="admin-form-group">
                  <label className="admin-label">Primary Email</label>
                  <input type="text" className="admin-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Primary Business Email" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Secondary Email</label>
                  <input type="text" className="admin-input" value={email_2} onChange={(e) => setEmail_2(e.target.value)} placeholder="Backup Business Email" />
                </div>
                {renderIconSelector("Email Icon", email_icon_, setEmail_icon_, "email_icon_")}
                <div className="admin-form-group">
                  <label className="admin-label">Clinic Timings</label>
                  <textarea className="admin-input" rows="3" value={clinic_hours} onChange={(e) => setClinic_hours(e.target.value)} placeholder="e.g., Mon-Sat: 9 AM - 8 PM"></textarea>
                </div>
                {renderIconSelector("Clinic Timings Icon", clinic_hours_icon, setClinic_hours_icon, "clinic_hours_icon")}
                {renderIconSelector("Sunnah Dates Icon", _sunnah_dates__this_month_, set_sunnah_dates__this_month_, "_sunnah_dates__this_month_")}
                <div className="admin-form-group">
                  <label className="admin-label">Sunnah Dates Summary</label>
                  <input type="text" className="admin-input" value={sunnah_dates__this_month_} onChange={(e) => setSunnah_dates__this_month_(e.target.value)} placeholder="e.g., 17th, 19th, 21st May" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Status</label>
                  <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowForm(false)}>Dismiss</button>
                {selectedId ? (
                  <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '750', display: 'flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', padding: '6px 12px', borderRadius: '20px', border: '1px solid #a7f3d0' }}>
                    <LucideIcons.Sparkles size={14} className="animate-pulse" /> Auto-save active
                  </div>
                ) : (
                  <button type="submit" className="admin-btn admin-btn-primary" disabled={isSaving}>
                    {isSaving ? 'Creating...' : 'Create & Initialize'}
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="admin-vertical-card-grid">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading core section data...</div>
            ) : data.length > 0 ? data.map((item) => (
              <div className="admin-info-card clickable-setup-card" key={item.id} onClick={() => openSectionEdit(item)} style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}>
                <div className="admin-info-row">
                  <span className="admin-info-label">Address</span>
                  <div className="admin-info-value" style={{ fontWeight: '500' }}>{item.address || '-'}</div>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">Phone Support</span>
                  <div className="admin-info-value" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {item.phone && <div>P1: {item.phone}</div>}
                    {item.phone_2 && <div style={{ fontSize: '11px', color: '#64748b' }}>P2: {item.phone_2}</div>}
                  </div>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">Support Emails</span>
                  <div className="admin-info-value" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {item.email && <div>{item.email}</div>}
                    {item.email_2 && <div style={{ fontSize: '11px', color: '#64748b' }}>{item.email_2}</div>}
                  </div>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">Sunnah Dates</span>
                  <div className="admin-info-value" style={{ color: '#0891b2', fontWeight: '700', fontSize: '12px' }}>{item.sunnah_dates__this_month_ || '-'}</div>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">Publication</span>
                  <div className="admin-info-value">
                    <span className={`admin-status-badge admin-status-${item.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

              </div>
            )) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#fff', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                No core contact configurations generated yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookYourAppointmentManager;

