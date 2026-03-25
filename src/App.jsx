import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import './i18n';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';

import AnalyzingPage from './pages/AnalyzingPage';
import DashboardPage from './pages/DashboardPage';
import LifestylePage from './pages/LifestylePage';
import ComparisonPage from './pages/ComparisonPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/upload" element={<UploadPage />} />

            <Route path="/analyzing" element={<AnalyzingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/lifestyle" element={<LifestylePage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </ThemeProvider>
  );
}
