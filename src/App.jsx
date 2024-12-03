import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import LandingPage from './pages/LandingPage';
import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from './config/firebase';
import { useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h3: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 700,
    },
  },
});

const checkAdminAccess = async (uid) => {
  try {
    console.log('Checking admin access for uid:', uid);
    const roleRef = ref(database, `users/${uid}/role`);
    const snapshot = await get(roleRef);
    const role = snapshot.val();
    console.log('Role from database:', role);
    return role === 'admin';
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
};

const AuthenticatedRoute = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        console.log('Checking admin access for:', user.email);
        const adminStatus = await checkAdminAccess(user.uid);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAccess();
  }, [user]);

  if (loading) {
    return null; // or a loading spinner
  }

  return <Navigate to={isAdmin ? "/dashboard" : "/user-dashboard"} replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const adminStatus = await checkAdminAccess(user.uid);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAccess();
  }, [user]);

  if (loading) {
    return null;
  }

  return isAdmin ? children : <Navigate to="/user-dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <Dashboard />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AuthenticatedRoute />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
