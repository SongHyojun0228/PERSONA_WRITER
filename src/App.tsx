import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import StoryViewerPage from './pages/StoryViewerPage';
import UserProfilePage from './pages/UserProfilePage';
import SearchPage from './pages/SearchPage';
import { MyPage } from './pages/MyPage';
import { NoticesPage } from './pages/NoticesPage';
import { useTheme } from './hooks/useTheme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UsernameSetupModal } from './components/UsernameSetupModal';

// Component to handle protected routes
const AppRoutes = () => {
  const { session, loading, needsUsername } = useAuth();
  useTheme(); // Apply theme

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
    {needsUsername && <UsernameSetupModal />}
    <Routes>
      <Route path="/login" element={!session ? <AuthPage /> : <Navigate to="/" />} />
      <Route path="/" element={session ? <HomePage /> : <LandingPage />} />
      <Route path="/dashboard/:projectId" element={session ? <DashboardPage /> : <Navigate to="/login" />} />
      <Route path="/my-page" element={session ? <MyPage /> : <Navigate to="/login" />} />
      <Route path="/story/:id" element={<StoryViewerPage />} />
      <Route path="/users/:userId" element={<UserProfilePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/notices" element={<NoticesPage />} />
    </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
