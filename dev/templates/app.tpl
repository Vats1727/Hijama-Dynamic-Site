import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/Admin/AdminLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import RecoverPassword from './pages/RecoverPassword';
import ProtectedRoute from './components/Admin/ProtectedRoute';
import AdminRoutes from './routes/AdminRoutes';
import { ToastProvider } from './components/Admin/ToastContext';

// [START_GENERATED_IMPORTS]
// [END_GENERATED_IMPORTS]

const App = () => {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<div>Website Home (Replace this)</div>} />
          
          {/* [START_PUBLIC_AUTH_ROUTES] */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/recover-password" element={<RecoverPassword />} />
          {/* [END_PUBLIC_AUTH_ROUTES] */}
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<div>Welcome to Admin Dashboard</div>} />
              <Route path="*" element={<AdminRoutes />} />
            </Route>
          </Route>

          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </ToastProvider>
  );
};

export default App;
