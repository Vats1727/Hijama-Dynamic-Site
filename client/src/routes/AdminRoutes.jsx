import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

// [START_GENERATED_IMPORTS]
const AboutSectionManager = lazy(() => import('../pages/Admin/Sections/AboutSectionManager'));
const BookYourAppointmentManager = lazy(() => import('../pages/Admin/Sections/BookYourAppointmentManager'));
const DoctorsListManager = lazy(() => import('../pages/Admin/Sections/DoctorsListManager'));
const DoctorsSectionManager = lazy(() => import('../pages/Admin/Sections/DoctorsSectionManager'));
const FooterManager = lazy(() => import('../pages/Admin/Sections/FooterManager'));
const HeroSectionManager = lazy(() => import('../pages/Admin/Sections/HeroSectionManager'));
const NavigationBarManager = lazy(() => import('../pages/Admin/Sections/NavigationBarManager'));
const ServiceListManager = lazy(() => import('../pages/Admin/Sections/ServiceListManager'));
const TestimonialSectionManager = lazy(() => import('../pages/Admin/Sections/TestimonialSectionManager'));
const Testimonials_ListManager = lazy(() => import('../pages/Admin/Sections/Testimonials_ListManager'));
const WhyHijamaManager = lazy(() => import('../pages/Admin/Sections/WhyHijamaManager'));
const Services_sectionManager = lazy(() => import('../pages/Admin/Sections/Services_sectionManager'));
// [END_GENERATED_IMPORTS]

const AdminRoutes = () => {
  return (
    <Suspense fallback={<div style={{ padding: '20px' }}>Loading Section...</div>}>
      <Routes>
        {/* [START_GENERATED_ROUTES] */}
<Route path="about_section" element={<AboutSectionManager />} />
      <Route path="book_your_appointment" element={<BookYourAppointmentManager />} />
      <Route path="doctors_list" element={<DoctorsListManager />} />
      <Route path="doctors_section" element={<DoctorsSectionManager />} />
      <Route path="footer" element={<FooterManager />} />
      <Route path="hero_section" element={<HeroSectionManager />} />
      <Route path="navigation_bar" element={<NavigationBarManager />} />
      <Route path="service_list" element={<ServiceListManager />} />
      <Route path="testimonial_section" element={<TestimonialSectionManager />} />
      <Route path="testimonials_list" element={<Testimonials_ListManager />} />
      <Route path="why_hijama" element={<WhyHijamaManager />} />
      <Route path="services_section" element={<Services_sectionManager />} />
{/* [END_GENERATED_ROUTES] */}
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
