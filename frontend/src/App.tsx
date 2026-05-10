import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Timeline from './pages/Timeline';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import ProtectedRoute from './pages/ProtectedRoute';
import Home from './pages/Home';
import AIChatWidget from './components/AI/AIChatWidget';
import Team from './pages/Team';


function ProtectedAI() {
  const location = useLocation();
  const protectedPaths = ['/dashboard', '/timeline', '/notifications', '/profile', '/admin'];
  const isProtected = protectedPaths.some(p => location.pathname.startsWith(p));
  if (!isProtected) return null;
  return <AIChatWidget />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>}/>
        </Routes>
        <ProtectedAI />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;