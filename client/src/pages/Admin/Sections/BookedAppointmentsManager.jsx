import React, { useState, useEffect } from 'react';
import { 
  Pencil, Trash2, Search, PlusCircle, X, CheckCircle, Clock, 
  Calendar, User, Phone, Mail, Stethoscope, MessageSquare, ShieldAlert, Filter, ChevronRight, Activity, XCircle
} from 'lucide-react';
import { crudService } from '../../../services/crud';
import { useToast } from '../../../components/Admin/ToastContext';

const BookedAppointmentsManager = () => {
  const { showToast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Submission Form Fields
  const [fname, setFname] = useState('');
  const [fphone, setFphone] = useState('');
  const [femail, setFemail] = useState('');
  const [fdoctor, setFdoctor] = useState('');
  const [fservice, setFservice] = useState('');
  const [fdate, setFdate] = useState('');
  const [ftime, setFtime] = useState('');
  const [fmessage, setFmessage] = useState('');
  const [appointment_status, setAppointment_status] = useState('pending');

  // Validation Errors
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const result = await crudService.getAll('appointment_submissions');
      setSubmissions(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      showToast('Error loading appointments data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleFnameChange = (val) => {
    if (val === '' || /^[a-zA-Z\s]+$/.test(val)) {
      setFname(val);
      setNameError('');
    } else {
      setNameError('Only alphabets allowed');
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
      setEmailError('Invalid email address');
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

  const resetForm = () => {
    setSelectedId(null);
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
  };

  const openEdit = (sub) => {
    setSelectedId(sub.id);
    setFname(sub.fname || '');
    setFphone(sub.fphone || '');
    setFemail(sub.femail || '');
    setFdoctor(sub.fdoctor || '');
    setFservice(sub.fservice || '');
    setFdate(convertToYMD(sub.fdate) || '');
    setFtime(sub.ftime || '');
    setFmessage(sub.fmessage || '');
    setAppointment_status(sub.appointment_status || 'pending');
    setNameError('');
    setPhoneError('');
    setEmailError('');
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    if (nameError || phoneError || emailError) {
      showToast('Please correct standard validation errors first.', 'error');
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
      if (selectedId) {
        await crudService.update('appointment_submissions', selectedId, formData);
        showToast('Appointment updated successfully');
      } else {
        await crudService.create('appointment_submissions', formData);
        showToast('Appointment created successfully');
      }
      setShowForm(false);
      resetForm();
      loadSubmissions();
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save appointment', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (sub) => {
    const nextStatus = sub.appointment_status === 'approved' ? 'pending' : 'approved';
    try {
      await crudService.update('appointment_submissions', sub.id, {
        appointment_status: nextStatus
      });
      showToast(`Status changed to ${nextStatus}`);
      loadSubmissions();
    } catch (err) {
      console.error(err);
      showToast('Failed to change status', 'error');
    }
  };

  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await crudService.delete('appointment_submissions', deleteTargetId);
      showToast('Deleted successfully');
      loadSubmissions();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete appointment', 'error');
    } finally {
      setShowConfirmModal(false);
      setDeleteTargetId(null);
    }
  };

  // 1. Filter data based on searches & states
  const filteredSubmissions = submissions.filter(sub => {
    const matchTerm = (sub.fname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                      (sub.fphone || '').includes(searchTerm) ||
                      (sub.femail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                      (sub.fdoctor?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchTerm;
    return matchTerm && sub.appointment_status === statusFilter;
  });

  // 2. Stats Calculation
  const totalCount = submissions.length;
  const pendingCount = submissions.filter(s => s.appointment_status === 'pending').length;
  const approvedCount = submissions.filter(s => s.appointment_status === 'approved').length;

  // 3. Pagination slicing
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const displaySubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={{ padding: '30px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      
      {/* Header Workspace Layout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Incoming Patient Inbox
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Overview, approve, reschedule and manage dynamic clinic bookings in real-time.
          </p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none',
              fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
            }}
          >
            <PlusCircle size={18} />
            Manual Entry
          </button>
        )}
      </div>

      {/* Stats Shelf (Wide Layout) */}
      {!showForm && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Requests</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>{totalCount}</span>
              <span style={{ padding: '6px', background: '#eff6ff', color: '#3b82f6', borderRadius: '8px' }}><Calendar size={20} /></span>
            </div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ color: '#b45309', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Approval</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: '#d97706' }}>{pendingCount}</span>
              <span style={{ padding: '6px', background: '#fef3c7', color: '#d97706', borderRadius: '8px' }}><Clock size={20} /></span>
            </div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ color: '#15803d', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approved / Closed</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: '#16a34a' }}>{approvedCount}</span>
              <span style={{ padding: '6px', background: '#dcfce7', color: '#16a34a', borderRadius: '8px' }}><CheckCircle size={20} /></span>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal Confirmation Popup */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 11000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', padding: '32px', borderRadius: '16px',
            maxWidth: '440px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center'
          }}>
            <div style={{ background: '#fee2e2', color: '#ef4444', width: '48px', height: '48px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShieldAlert size={24} />
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>Confirm Deletion</h3>
            <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>Are you sure you want to permanently erase this appointment submission record? This cannot be reverted.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: '600' }}
                onClick={confirmDelete}
              >
                Permanently Delete
              </button>
              <button 
                style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => { setShowConfirmModal(false); setDeleteTargetId(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm ? (
        /* Standard Form Layout for Add/Edit */
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '28px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selectedId ? <><Pencil size={18} /> Reschedule & Edit Appointment</> : <><PlusCircle size={18} /> Create Manual Appointment</>}
            </h2>
            <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', color: '#64748b' }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <div className="admin-form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Full Name *</label>
                <input 
                  type="text" className="admin-input" value={fname} required
                  onChange={(e) => handleFnameChange(e.target.value)} placeholder="Full Name"
                />
                {nameError && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{nameError}</span>}
              </div>
              <div className="admin-form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Phone *</label>
                <input 
                  type="tel" className="admin-input" value={fphone} required
                  onChange={(e) => handleFphoneChange(e.target.value)} placeholder="Phone Number"
                />
                {phoneError && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{phoneError}</span>}
              </div>
              <div className="admin-form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Email Address</label>
                <input 
                  type="email" className="admin-input" value={femail}
                  onChange={(e) => handleFemailChange(e.target.value)} placeholder="email@example.com"
                />
                {emailError && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{emailError}</span>}
              </div>
              <div className="admin-form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Practitioner Doctor</label>
                <input 
                  type="text" className="admin-input" value={fdoctor}
                  onChange={(e) => setFdoctor(e.target.value)} placeholder="e.g. Dr. Ahmed"
                />
              </div>
              <div className="admin-form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Selected Service</label>
                <input 
                  type="text" className="admin-input" value={fservice}
                  onChange={(e) => setFservice(e.target.value)} placeholder="e.g. Wet Cupping"
                />
              </div>
              <div className="admin-form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Appointment Date</label>
                <input 
                  type="date" className="admin-input" value={fdate}
                  onChange={(e) => setFdate(e.target.value)} 
                />
              </div>
              <div className="admin-form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Booking Time Slot</label>
                <input 
                  type="text" className="admin-input" value={ftime}
                  onChange={(e) => setFtime(e.target.value)} placeholder="e.g. 10:00 AM"
                />
              </div>
              <div className="admin-form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Status</label>
                <select 
                  className="admin-input" value={appointment_status}
                  onChange={(e) => setAppointment_status(e.target.value)}
                  style={{ height: '45px' }}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Health Message / Notes</label>
                <textarea 
                  className="admin-input" rows="3" value={fmessage}
                  onChange={(e) => setFmessage(e.target.value)} placeholder="Patient's concerns..."
                />
              </div>
            </div>
            <div style={{ marginTop: '32px', display: 'flex', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
              <button type="submit" disabled={isSaving} style={{ background: '#2563eb', color: '#fff', fontWeight: '600', padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
                {isSaving ? 'Processing...' : selectedId ? 'Save Workspace Changes' : 'Generate Booking'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                Discard
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Table / Inbox Workspace */
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          
          {/* Table Filtering Row */}
          <div style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', borderBottom: '1px solid #f1f5f9', background: '#fbfcfd' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                style={{ 
                  padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  background: statusFilter === 'all' ? '#0f172a' : 'transparent', 
                  color: statusFilter === 'all' ? '#fff' : '#64748b'
                }}
              >
                All Items
              </button>
              <button 
                onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
                style={{ 
                  padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  background: statusFilter === 'pending' ? '#fef3c7' : 'transparent', 
                  color: statusFilter === 'pending' ? '#d97706' : '#64748b'
                }}
              >
                Pending ({pendingCount})
              </button>
              <button 
                onClick={() => { setStatusFilter('approved'); setCurrentPage(1); }}
                style={{ 
                  padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  background: statusFilter === 'approved' ? '#dcfce7' : 'transparent', 
                  color: statusFilter === 'approved' ? '#16a34a' : '#64748b'
                }}
              >
                Approved ({approvedCount})
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '320px', flex: '1 1 320px', maxWidth: '400px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
              <input 
                type="text" placeholder="Search patient name, phone, doctor..." 
                value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ 
                  padding: '10px 16px 10px 38px', border: '1px solid #e2e8f0', borderRadius: '10px', width: '100%', fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Standard Wide Responsive Data Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', width: '22%' }}>Patient Details</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', width: '18%' }}>Request Schedule</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', width: '22%' }}>Preferences</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', width: '16%' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', textAlign: 'right', width: '22%' }}>Workspace Controls</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading patient inbox data...</td>
                  </tr>
                ) : displaySubmissions.length > 0 ? displaySubmissions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fafbfd'} onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#eff6ff', color: '#3b82f6', height: '40px', width: '40px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px' }}>
                          {(sub.fname || 'P')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{sub.fname}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {sub.fphone}</div>
                            {sub.femail && <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {sub.femail}</div>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} style={{ color: '#64748b' }} />
                        {convertToDMY(sub.fdate)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} style={{ color: '#94a3b8' }} />
                        {sub.ftime || 'TBD'}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', fontSize: '11px', fontWeight: '600', color: '#334155', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', alignSelf: 'start' }}>
                          <Stethoscope size={12}/> Doc: {sub.fdoctor || 'Any'}
                        </span>
                        <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', fontSize: '11px', fontWeight: '600', color: '#1d4ed8', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px', alignSelf: 'start' }}>
                          <Activity size={12}/> Service: {sub.fservice || 'General'}
                        </span>
                      </div>
                      {sub.fmessage && (
                        <div style={{ marginTop: '8px', color: '#475569', fontSize: '11px', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px', display: 'flex', alignItems: 'center', gap: '6px' }} title={sub.fmessage}>
                          <MessageSquare size={12} style={{ flexShrink: 0, color: '#94a3b8' }} /> "{sub.fmessage}"
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span 
                        onClick={() => toggleStatus(sub)}
                        style={{ 
                          cursor: 'pointer', userSelect: 'none',
                          padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: sub.appointment_status === 'approved' ? '#dcfce7' : '#fef3c7',
                          color: sub.appointment_status === 'approved' ? '#15803d' : '#b45309',
                          border: `1px solid ${sub.appointment_status === 'approved' ? '#bbf7d0' : '#fde68a'}`
                        }}
                      >
                        {sub.appointment_status === 'approved' ? <><CheckCircle size={12}/> Approved</> : <><Clock size={12}/> Pending</>}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => toggleStatus(sub)}
                          style={{ 
                            border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', 
                            fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '6px',
                            display: 'flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          {sub.appointment_status === 'approved' ? <><XCircle size={14}/> Unapprove</> : <><CheckCircle size={14}/> Approve</>}
                        </button>
                        <button 
                          onClick={() => openEdit(sub)}
                          style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                          title="Edit Schedule"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(sub.id)}
                          style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                      No appointments match your search criteria or inbox status filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Traditional Wide Layout Pagination Row */}
          {totalPages > 1 && (
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', background: '#fff' }}>
              <div style={{ color: '#64748b', fontSize: '13px' }}>
                Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  style={{ 
                    padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, fontSize: '13px', fontWeight: '600'
                  }}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i} onClick={() => setCurrentPage(i + 1)}
                    style={{ 
                      padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                      background: currentPage === i + 1 ? '#2563eb' : 'transparent',
                      color: currentPage === i + 1 ? '#fff' : '#64748b'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  style={{ 
                    padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, fontSize: '13px', fontWeight: '600'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookedAppointmentsManager;
