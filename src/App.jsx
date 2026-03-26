import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import './i18n';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import AnalyzingPage from './pages/AnalyzingPage';
import { Analytics } from '@vercel/analytics/react';

// Lazy-loaded pages (not needed on initial load)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LifestylePage = lazy(() => import('./pages/LifestylePage'));
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const GlossaryPage = lazy(() => import('./pages/GlossaryPage'));
const PreAnalysisPage = lazy(() => import('./pages/PreAnalysisPage'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '50vh', color: 'var(--text-muted)',
    }}>
      <span className="animate-pulse" style={{ fontSize: '1rem' }}>Loading...</span>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Header />
        <main style={{ flex: 1 }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/pre-analysis" element={<PreAnalysisPage />} />
              <Route path="/analyzing" element={<AnalyzingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/lifestyle" element={<LifestylePage />} />
              <Route path="/compare" element={<ComparisonPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/glossary" element={<GlossaryPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <MobileNav />
      </BrowserRouter>
      <Analytics />
    </ThemeProvider>
  );
}
