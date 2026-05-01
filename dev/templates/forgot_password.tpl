import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Admin/ToastContext.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const showToast = (msg, type) => {
    if (toast && typeof toast.showToast === 'function') {
      toast.showToast(msg, type);
    } else {
      alert(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('[ForgotPassword] Sending OTP to:', email);
      const res = await api.post('/auth/forgot-password', { email });
      console.log('[ForgotPassword] Server Response:', res.data);
      
      if (res.data.success) {
        showToast('OTP sent to your email!', 'success');
        setTimeout(() => navigate('/recover-password', { state: { email } }), 1000);
      } else {
        console.error('[ForgotPassword] Reset Failed:', res.data.error);
        showToast(res.data.error || 'Failed to send reset link', 'error');
      }
    } catch (error) {
      console.error('[ForgotPassword] Network Error:', error);
      const msg = error.response?.data?.error || 'Network error. Please try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <ShieldCheck size={40} color="#6366f1" />
          </div>
          <h1>Forgot Password?</h1>
          <p>Enter your email to receive a password reset OTP</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Recovery OTP'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6366f1', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>

      <style>{`
        .login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 20px; font-family: 'Outfit', sans-serif; }
        .login-card { width: 100%; max-width: 420px; background: white; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.06); padding: 40px; border: 1px solid #f1f5f9; }
        .login-header { text-align: center; margin-bottom: 32px; }
        .login-logo { width: 72px; height: 72px; background: #f5f7ff; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .login-header h1 { font-size: 24px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
        .login-header p { color: #64748b; font-size: 14px; }
        .login-form .form-group { margin-bottom: 20px; }
        .login-form label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; }
        .input-wrapper { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 16px; color: #94a3b8; }
        .input-wrapper input { width: 100%; padding: 14px 16px 14px 48px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 14px; transition: 0.2s; }
        .input-wrapper input:focus { outline: none; border-color: #6366f1; background: white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        .login-btn { width: 100%; padding: 14px; background: #6366f1; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.2s; margin-top: 12px; }
        .login-btn:hover { background: #4f46e5; transform: translateY(-1px); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .login-footer { margin-top: 32px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 24px; }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
