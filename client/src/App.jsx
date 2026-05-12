import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/Admin/ProtectedRoute';
import RecoverPassword from './pages/RecoverPassword';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import { ToastProvider } from './components/Admin/ToastContext';
import AdminLayout from './components/Admin/AdminLayout';
import AdminRoutes from './routes/AdminRoutes';
import React from 'react';
import './styles/global.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatBot from './components/layout/ChatBot';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Services from './components/sections/Services';
import Doctors from './components/sections/Doctors';
import Benefits from './components/sections/Benefits';
import Testimonials from './components/sections/Testimonials';
import Contact from './components/sections/Contact';
import useRevealAnimation from './hooks/useRevealAnimation';

function App() {
  useRevealAnimation();

  return (
    <ToastProvider>
      <Router basename={import.meta.env.VITE_ROUTER_BASE || '/'}>
        <Routes>
          {/* [START_PUBLIC_AUTH_ROUTES] */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/recover-password" element={<RecoverPassword />} />
          {/* [END_PUBLIC_AUTH_ROUTES] */}
          <Route path="/" element={<div className="App">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Doctors />
        <Benefits />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <ChatBot />
    </div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<div style={{ padding: '20px' }}><h1>Welcome to Admin Dashboard</h1><p>Select a section from the sidebar to manage content.</p></div>} />
              <Route path="*" element={<AdminRoutes />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
