import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import StoryViewerPage from './pages/StoryViewerPage';
import UserProfilePage from './pages/UserProfilePage';
import SearchPage from './pages/SearchPage'; // Import SearchPage
import { MyPage } from './pages/MyPage';
import { useTheme } from './hooks/useTheme';
import { AuthProvider, useAuth } from './context/AuthContext';

// Component to handle protected routes
const AppRoutes = () => {
  const { session, loading } = useAuth();
  useTheme(); // Apply theme

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!session ? <AuthPage /> : <Navigate to="/" />} />
      <Route path="/" element={session ? <HomePage /> : <Navigate to="/login" />} />
      <Route path="/dashboard/:projectId" element={session ? <DashboardPage /> : <Navigate to="/login" />} />
      <Route path="/my-page" element={session ? <MyPage /> : <Navigate to="/login" />} />
      <Route path="/story/:id" element={<StoryViewerPage />} />
      <Route path="/users/:userId" element={<UserProfilePage />} />
      <Route path="/search" element={<SearchPage />} /> {/* New route for SearchPage */}
    </Routes>
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
