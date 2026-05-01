import React, { useState, useEffect } from 'react';
import SectionTitle from '../common/SectionTitle';
import { crudService } from '../../services/crud';
import * as LucideIcons from 'lucide-react';

const renderContactIcon = (iconName, fallbackEmoji) => {
  if (!iconName) return <span className="contact-icon">{fallbackEmoji}</span>;
  if (LucideIcons[iconName]) {
    const IconComponent = LucideIcons[iconName];
    return <span className="contact-icon"><IconComponent size={24} /></span>;
  }
  const cleanName = iconName.replace('Lucide', '');
  if (LucideIcons[cleanName]) {
    const IconComponent = LucideIcons[cleanName];
    return <span className="contact-icon"><IconComponent size={24} /></span>;
  }
  return <span className="contact-icon">{iconName}</span>;
};

const Contact = () => {
  const [formSuccess, setFormSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fname: '',
    fphone: '',
    femail: '',
    fdoctor: '',
    fservice: '',
    fdate: '',
    ftime: '09:00 AM',
    fmessage: ''
  });

  const [contactData, setContactData] = useState({
    tag: '',
    title: '',
    desc: '',
    address: '',
    phone: '',
    phone_2: '',
    phone_icon: '',
    email: '',
    email_2: '',
    email_icon_: '',
    clinic_hours: '',
    clinic_hours_icon: '',
    sunnah_dates__this_month_: '',
    _sunnah_dates__this_month_: ''
  });

  // Inline validation errors
  const [nameErr, setNameErr] = useState('');
  const [phoneErr, setPhoneErr] = useState('');
  const [emailErr, setEmailErr] = useState('');

  useEffect(() => {
    const loadContactData = async () => {
      try {
        const rows = await crudService.getAll('book_your_appointment');
        const activeItem = (rows && Array.isArray(rows)) ? rows.find(item => item.status === 'Active') : null;
        if (activeItem) {
          setContactData(prev => ({
            ...prev,
            ...activeItem,
            tag: activeItem.get_in_touch_label_ || prev.tag,
            title: activeItem.section_title_ || prev.title,
            desc: activeItem.section_description || prev.desc,
            address: activeItem.address || prev.address,
            phone: activeItem.phone || prev.phone,
            phone_2: activeItem.phone_2 || prev.phone_2,
            phone_icon: activeItem.phone_icon || prev.phone_icon,
            email: activeItem.email || prev.email,
            email_2: activeItem.email_2 || prev.email_2,
            email_icon_: activeItem.email_icon_ || prev.email_icon_,
            clinic_hours: activeItem.clinic_hours || prev.clinic_hours,
            clinic_hours_icon: activeItem.clinic_hours_icon || prev.clinic_hours_icon,
            sunnah_dates__this_month_: activeItem.sunnah_dates__this_month_ || prev.sunnah_dates__this_month_,
            _sunnah_dates__this_month_: activeItem._sunnah_dates__this_month_ || prev._sunnah_dates__this_month_,
          }));
        } else {
          setContactData({
            tag: '',
            title: '',
            desc: '',
            address: '',
            phone: '',
            phone_2: '',
            phone_icon: '',
            email: '',
            email_2: '',
            email_icon_: '',
            clinic_hours: '',
            clinic_hours_icon: '',
            sunnah_dates__this_month_: '',
            _sunnah_dates__this_month_: ''
          });
        }
      } catch (err) {
        console.error('Failed to load contact data:', err);
        setContactData({
          tag: '',
          title: '',
          desc: '',
          address: '',
          phone: '',
          phone_2: '',
          phone_icon: '',
          email: '',
          email_2: '',
          email_icon_: '',
          clinic_hours: '',
          clinic_hours_icon: '',
          sunnah_dates__this_month_: '',
          _sunnah_dates__this_month_: ''
        });
      }
    };
    loadContactData();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === 'fname') {
      if (value === '' || /^[a-zA-Z\s]+$/.test(value)) {
        setFormData(prev => ({ ...prev, [id]: value }));
        setNameErr('');
      } else {
        setNameErr('Only alphabets are allowed');
      }
    } else if (id === 'fphone') {
      if (value === '') {
        setFormData(prev => ({ ...prev, [id]: value }));
        setPhoneErr('');
      } else if (/^\d+$/.test(value)) {
        if (value.length <= 14) {
          setFormData(prev => ({ ...prev, [id]: value }));
          setPhoneErr('');
        } else {
          setPhoneErr('Max 14 digits allowed');
        }
      } else {
        setPhoneErr('Only numbers are allowed');
      }
    } else if (id === 'femail') {
      setFormData(prev => ({ ...prev, [id]: value }));
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value === '' || emailRegex.test(value)) {
        setEmailErr('');
      } else {
        setEmailErr('Invalid standard email format');
      }
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fname || !formData.fphone) {
      alert('Please fill in your name and phone number to continue.');
      return;
    }

    if (nameErr || phoneErr || emailErr) {
      alert('Please resolve validation errors first.');
      return;
    }

    // Convert date to DD-MM-YYYY
    const formattedDate = convertToDMY(formData.fdate);
    const submissionData = { ...formData, fdate: formattedDate };

    try {
      await crudService.create('appointment_submissions', submissionData);
      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setFormData({
          fname: '',
          fphone: '',
          femail: '',
          fdoctor: '',
          fservice: '',
          fdate: '',
          ftime: '09:00 AM',
          fmessage: ''
        });
      }, 5000);
    } catch (err) {
      console.error('Failed to submit appointment request:', err);
      alert('Something went wrong. Please try again or contact us directly via phone.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section id="contact">
      <SectionTitle 
        tag={contactData.tag}
        title={contactData.title}
        desc={contactData.desc}
      />
      <div className="contact-layout">
        <div className="contact-info reveal">
          <div className="contact-item">
            {renderContactIcon(contactData.location, "📍")}
            <div>
              <div className="contact-item-title">Address</div>
              <div className="contact-item-val">
                {contactData.address ? contactData.address.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < contactData.address.split('\n').length - 1 && <br />}
                  </React.Fragment>
                )) : 'Address info not set'}
              </div>
            </div>
          </div>
          <div className="contact-item">
            {renderContactIcon(contactData.phone_icon, "📞")}
            <div>
              <div className="contact-item-title">Phone</div>
              <div className="contact-item-val">
                {contactData.phone}
                {contactData.phone_2 && <><br />{contactData.phone_2}</>}
              </div>
            </div>
          </div>
          <div className="contact-item">
            {renderContactIcon(contactData.email_icon_, "📧")}
            <div>
              <div className="contact-item-title">Email</div>
              <div className="contact-item-val">
                {contactData.email}
                {contactData.email_2 && <><br />{contactData.email_2}</>}
              </div>
            </div>
          </div>
          <div className="contact-item">
            {renderContactIcon(contactData.clinic_hours_icon, "🕐")}
            <div>
              <div className="contact-item-title">Clinic Hours</div>
              <div className="contact-item-val">
                {contactData.clinic_hours ? contactData.clinic_hours.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < contactData.clinic_hours.split('\n').length - 1 && <br />}
                  </React.Fragment>
                )) : 'Clinic hours not set'}
              </div>
            </div>
          </div>
          <div className="contact-item">
            {renderContactIcon(contactData._sunnah_dates__this_month_, "🌙")}
            <div>
              <div className="contact-item-title">Sunnah Dates (This Month)</div>
              <div className="contact-item-val" id="sunnahDates">{contactData.sunnah_dates__this_month_}</div>
            </div>
          </div>
        </div>
        <div className="reveal">
          <div className="contact-form">
            <div className="form-title">Request an Appointment</div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" id="fname" placeholder="Your full name" required value={formData.fname} onChange={handleChange} />
                  {nameErr && <div style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '4px' }}>{nameErr}</div>}
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" id="fphone" placeholder="+91 00000 00000" required value={formData.fphone} onChange={handleChange} />
                  {phoneErr && <div style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '4px' }}>{phoneErr}</div>}
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" id="femail" placeholder="your@email.com" value={formData.femail} onChange={handleChange} />
                {emailErr && <div style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '4px' }}>{emailErr}</div>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Doctor</label>
                  <select id="fdoctor" value={formData.fdoctor} onChange={handleChange}>
                    <option value="">Any Available Doctor</option>
                    <option value="ahmed">Dr. Ahmed Al-Farsi (Male)</option>
                    <option value="fatima">Dr. Fatima Siddiqui (Female)</option>
                    <option value="yusuf">Dr. Yusuf Hassan (Male)</option>
                    <option value="maryam">Dr. Maryam Ansari (Female)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Service Type</label>
                  <select id="fservice" value={formData.fservice} onChange={handleChange}>
                    <option value="">Select Service</option>
                    <option>Wet Cupping (Hijama)</option>
                    <option>Dry Cupping</option>
                    <option>Fire Cupping</option>
                    <option>Massage Cupping</option>
                    <option>Herbal Cupping</option>
                    <option>Paediatric Cupping</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Date</label>
                  <input type="date" id="fdate" min={today} value={formData.fdate} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Preferred Time</label>
                  <select id="ftime" value={formData.ftime} onChange={handleChange}>
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>12:00 PM</option>
                    <option>02:00 PM</option>
                    <option>03:00 PM</option>
                    <option>04:00 PM</option>
                    <option>05:00 PM</option>
                    <option>06:00 PM</option>
                    <option>07:00 PM</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Health Concern / Message</label>
                <textarea id="fmessage" placeholder="Briefly describe your health concern or any specific requirements..." value={formData.fmessage} onChange={handleChange}></textarea>
              </div>
              {!formSuccess ? (
                <button type="submit" className="form-submit">Confirm Appointment Request ✓</button>
              ) : (
                <div className="form-success" style={{ display: 'block' }}>
                  ✅ Thank you! Your appointment request has been received. We will call you within 2 hours to confirm your booking. JazakAllah Khair!
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
