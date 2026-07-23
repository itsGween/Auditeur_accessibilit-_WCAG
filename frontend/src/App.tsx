import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { SiteHistoryPage } from './pages/SiteHistoryPage';
import { ScanDetailPage } from './pages/ScanDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DEFAULT_LANGUAGE } from './i18n/languages';

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/${DEFAULT_LANGUAGE}`} replace />} />
        <Route path=":lang" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="sites/:siteId" element={<SiteHistoryPage />} />
          <Route path="scans/:scanId" element={<ScanDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<Navigate to={`/${DEFAULT_LANGUAGE}`} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
