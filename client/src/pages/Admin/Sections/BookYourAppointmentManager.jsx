import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  Pencil, Trash2, Search, PlusCircle, X, CheckCircle, Clock
} from 'lucide-react';
import { crudService } from '../../../services/crud';
import { useToast } from '../../../components/Admin/ToastContext';

const BookYourAppointmentManager = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('section'); // section or submissions
  
  // Tab 1: Section Data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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

  // Tab 2: Anonymous User Submissions
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);
  const [subSelectedId, setSubSelectedId] = useState(null);

  // Pagination for submissions
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Custom Delete Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Submission editing fields
  const [fname, setFname] = useState('');
  const [fphone, setFphone] = useState('');
  const [femail, setFemail] = useState('');
  const [fdoctor, setFdoctor] = useState('');
  const [fservice, setFservice] = useState('');
  const [fdate, setFdate] = useState('');
  const [ftime, setFtime] = useState('');
  const [fmessage, setFmessage] = useState('');
  const [appointment_status, setAppointment_status] = useState('pending');

  // Inline Validation States
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [dateError, setDateError] = useState('');

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

  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const result = await crudService.getAll('appointment_submissions');
      setSubmissions(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    loadData();
    loadSubmissions();
  }, []);

  // Section Save Handler
  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

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
        showToast('Updated successfully');
      } else {
        await crudService.create('book_your_appointment', formData);
        showToast('Created successfully');
      }
      setShowForm(false);
      resetSectionForm();
      loadData();
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save section info', 'error');
    } finally {
      setIsSaving(false);
    }
  };

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

  // Validation Checkers & Inputs
  const handleFnameChange = (val) => {
    if (val === '' || /^[a-zA-Z\s]+$/.test(val)) {
      setFname(val);
      setNameError('');
    } else {
      setNameError('Only alphabets are allowed');
    }
  };

  const handleFphoneChange = (val) => {
    if (val === '') {
      setFphone(val);
      setPhoneError('');
    } else if (/^\d+$/.test(val)) {
      if (val.length <= 14) {
        setFphone(val);
        setPhoneError('');
      } else {
        setPhoneError('Max 14 digits allowed');
      }
    } else {
      setPhoneError('Only numbers allowed');
    }
  };

  const handleFemailChange = (val) => {
    setFemail(val);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val === '' || emailRegex.test(val)) {
      setEmailError('');
    } else {
      setEmailError('Invalid email format');
    }
  };

  const convertToDMY = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD -> DD-MM-YYYY
      }
    }
    return dateStr;
  };

  const convertToYMD = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY -> YYYY-MM-DD
      }
    }
    return dateStr;
  };

  // Submissions handlers
  const openSubEdit = (sub) => {
    setSubSelectedId(sub.id);
    setFname(sub.fname || '');
    setFphone(sub.fphone || '');
    setFemail(sub.femail || '');
    setFdoctor(sub.fdoctor || '');
    setFservice(sub.fservice || '');
    // Ensure date picker is bound to YYYY-MM-DD format
    setFdate(convertToYMD(sub.fdate) || '');
    setFtime(sub.ftime || '');
    setFmessage(sub.fmessage || '');
    setAppointment_status(sub.appointment_status || 'pending');
    setNameError('');
    setPhoneError('');
    setEmailError('');
    setDateError('');
    setShowSubForm(true);
  };

  const handleSaveSub = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    // Direct error check
    if (nameError || phoneError || emailError) {
      showToast('Please resolve validation errors first.', 'error');
      return;
    }

    setIsSaving(true);

    const formattedDate = convertToDMY(fdate);
    const formData = {
      fname,
      fphone,
      femail,
      fdoctor,
      fservice,
      fdate: formattedDate,
      ftime,
      fmessage,
      appointment_status
    };

    try {
      if (subSelectedId) {
        await crudService.update('appointment_submissions', subSelectedId, formData);
        showToast('Submission updated successfully');
      } else {
        await crudService.create('appointment_submissions', formData);
        showToast('Submission added successfully');
      }
      setShowSubForm(false);
      resetSubForm();
      loadSubmissions();
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save submission info', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSubForm = () => {
    setSubSelectedId(null);
    setFname('');
    setFphone('');
    setFemail('');
    setFdoctor('');
    setFservice('');
    setFdate('');
    setFtime('');
    setFmessage('');
    setAppointment_status('pending');
    setNameError('');
    setPhoneError('');
    setEmailError('');
    setDateError('');
  };

  const handleToggleStatus = async (sub) => {
    const nextStatus = sub.appointment_status === 'approved' ? 'pending' : 'approved';
    try {
      await crudService.update('appointment_submissions', sub.id, {
        appointment_status: nextStatus
      });
      showToast(`Appointment status updated to ${nextStatus}`);
      loadSubmissions();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
    setShowConfirmModal(true);
  };

  const confirmDeleteSub = async () => {
    if (!deleteTargetId) return;
    try {
      await crudService.delete('appointment_submissions', deleteTargetId);
      showToast('Deleted submission successfully');
      loadSubmissions();
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete submission', 'error');
    } finally {
      setShowConfirmModal(false);
      setDeleteTargetId(null);
    }
  };

  // Pagination filtering
  const totalPages = Math.ceil(submissions.length / itemsPerPage);
  const currentSubmissions = submissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="admin-section">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Book Your Appointment</h2>
          <p className="admin-card-subtitle">Manage Section Content and User Submissions</p>
        </div>
      </div>

      {/* Custom Confirmation Popup Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', padding: '24px', borderRadius: '12px',
            maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0', textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 12px', color: '#1e293b' }}>Confirm Deletion</h3>
            <p style={{ margin: '0 0 24px', color: '#64748b' }}>Are you sure you want to delete this submission record? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={confirmDeleteSub}
              >
                Delete Record
              </button>
              <button 
                style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => { setShowConfirmModal(false); setDeleteTargetId(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', paddingBottom: '2px' }}>
        <button 
          className={`tab-btn ${activeTab === 'section' ? 'active' : ''}`}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: activeTab === 'section' ? '#2563eb' : 'transparent',
            color: activeTab === 'section' ? '#fff' : '#475569',
            fontWeight: '600',
            cursor: 'pointer',
            borderRadius: '6px'
          }}
          onClick={() => setActiveTab('section')}
        >
          Section Data
        </button>
        <button 
          className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: activeTab === 'submissions' ? '#2563eb' : 'transparent',
            color: activeTab === 'submissions' ? '#fff' : '#475569',
            fontWeight: '600',
            cursor: 'pointer',
            borderRadius: '6px'
          }}
          onClick={() => setActiveTab('submissions')}
        >
          Booked Appointments
        </button>
      </div>

      {activeTab === 'section' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Section Configuration</h3>
            {!showForm && (
              <button className="admin-btn admin-btn-primary" onClick={() => { resetSectionForm(); setShowForm(true); }}>
                <PlusCircle size={16} /> Add Section Data
              </button>
            )}
          </div>

          {showForm ? (
            <div className="admin-card">
              <form onSubmit={handleSaveSection}>
                <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div className="admin-form-group">
                    <label className="admin-label">Section Title</label>
                    <input type="text" className="admin-input" value={section_title_} onChange={(e) => setSection_title_(e.target.value)} required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Section Description</label>
                    <input type="text" className="admin-input" value={section_description} onChange={(e) => setSection_description(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Address</label>
                    <textarea className="admin-input" rows="3" value={address} onChange={(e) => setAddress(e.target.value)}></textarea>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Location Icon</label>
                    <input type="text" className="admin-input" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Phone 1</label>
                    <input type="text" className="admin-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Phone 2</label>
                    <input type="text" className="admin-input" value={phone_2} onChange={(e) => setPhone_2(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Phone Icon</label>
                    <input type="text" className="admin-input" value={phone_icon} onChange={(e) => setPhone_icon(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Email 1</label>
                    <input type="text" className="admin-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Email 2</label>
                    <input type="text" className="admin-input" value={email_2} onChange={(e) => setEmail_2(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Email Icon</label>
                    <input type="text" className="admin-input" value={email_icon_} onChange={(e) => setEmail_icon_(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Clinic Hours</label>
                    <textarea className="admin-input" rows="3" value={clinic_hours} onChange={(e) => setClinic_hours(e.target.value)}></textarea>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Clinic Hours Icon</label>
                    <input type="text" className="admin-input" value={clinic_hours_icon} onChange={(e) => setClinic_hours_icon(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Sunnah Dates Icon</label>
                    <input type="text" className="admin-input" value={_sunnah_dates__this_month_} onChange={(e) => set_sunnah_dates__this_month_(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Sunnah Dates Details</label>
                    <input type="text" className="admin-input" value={sunnah_dates__this_month_} onChange={(e) => setSunnah_dates__this_month_(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Status</label>
                    <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                  <button type="submit" className="admin-btn admin-btn-primary">{selectedId ? 'Update Section' : 'Create Section'}</button>
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="admin-card">
              <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Desc</th>
                      <th>Address</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.id}>
                        <td>{item.section_title_}</td>
                        <td>{item.section_description}</td>
                        <td>{item.address}</td>
                        <td>{item.phone}</td>
                        <td>{item.email}</td>
                        <td>{item.status}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="admin-action-btn" style={{ color: '#3b82f6' }} onClick={() => openSectionEdit(item)}><Pencil size={14} /></button>
                            <button className="admin-action-btn" style={{ color: '#ef4444' }} onClick={() => handleDeleteSection(item.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'submissions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Booked Appointments Data Table</h3>
            {!showSubForm && (
              <button className="admin-btn admin-btn-primary" onClick={() => { resetSubForm(); setShowSubForm(true); }}>
                <PlusCircle size={16} /> Add Submission Record
              </button>
            )}
          </div>

          {showSubForm ? (
            <div className="admin-card">
              <form onSubmit={handleSaveSub}>
                <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div className="admin-form-group">
                    <label className="admin-label">Full Name</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={fname} 
                      onChange={(e) => handleFnameChange(e.target.value)} 
                      placeholder="Only Alphabets allowed"
                      required 
                    />
                    {nameError && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{nameError}</span>}
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Phone</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={fphone} 
                      onChange={(e) => handleFphoneChange(e.target.value)} 
                      placeholder="Only numbers allowed, Max 14 digits"
                      required 
                    />
                    {phoneError && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{phoneError}</span>}
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Email</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={femail} 
                      onChange={(e) => handleFemailChange(e.target.value)} 
                      placeholder="Valid standard email"
                    />
                    {emailError && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{emailError}</span>}
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Doctor</label>
                    <input type="text" className="admin-input" value={fdoctor} onChange={(e) => setFdoctor(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Service</label>
                    <input type="text" className="admin-input" value={fservice} onChange={(e) => setFservice(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Date (DD-MM-YYYY)</label>
                    <input type="date" className="admin-input" value={fdate} onChange={(e) => setFdate(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Time</label>
                    <input type="text" className="admin-input" value={ftime} onChange={(e) => setFtime(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Status</label>
                    <select className="admin-input" value={appointment_status} onChange={(e) => setAppointment_status(e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                    </select>
                  </div>
                  <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="admin-label">Health Message</label>
                    <textarea className="admin-input" rows="3" value={fmessage} onChange={(e) => setFmessage(e.target.value)}></textarea>
                  </div>
                </div>
                <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                  <button type="submit" className="admin-btn admin-btn-primary">{subSelectedId ? 'Update Submission' : 'Add Submission'}</button>
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowSubForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="admin-card">
              <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Phone</th>
                      <th>Doctor</th>
                      <th>Service</th>
                      <th>Date / Time</th>
                      <th>Status Toggle</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubmissions.map((sub) => (
                      <tr key={sub.id}>
                        <td>{sub.fname}</td>
                        <td>{sub.fphone}</td>
                        <td>{sub.fdoctor || 'Any'}</td>
                        <td>{sub.fservice || 'Not Specified'}</td>
                        <td>{convertToDMY(sub.fdate)} {sub.ftime}</td>
                        <td>
                          <button 
                            style={{
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              background: sub.appointment_status === 'approved' ? '#22c55e' : '#eab308',
                              color: '#fff'
                            }}
                            onClick={() => handleToggleStatus(sub)}
                          >
                            {sub.appointment_status === 'approved' ? 'Approved ✓' : 'Pending...'}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="admin-action-btn" style={{ color: '#3b82f6' }} onClick={() => openSubEdit(sub)}><Pencil size={14} /></button>
                            <button className="admin-action-btn" style={{ color: '#ef4444' }} onClick={() => openDeleteModal(sub.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button 
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1
                    }}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button 
                      key={i + 1}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        background: currentPage === i + 1 ? '#2563eb' : '#fff',
                        color: currentPage === i + 1 ? '#fff' : '#000',
                        cursor: 'pointer'
                      }}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1
                    }}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookYourAppointmentManager;
