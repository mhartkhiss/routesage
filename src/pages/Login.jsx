import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Snackbar,
  Alert,
  useTheme,
  Grid,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { auth, database } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import logorsage from '../assets/logorsage.png';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const theme = useTheme();

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      console.log('User logged in:', result.user.email);
      const isAdmin = await checkAdminAccess(result.user.uid);
      console.log('Is admin?', isAdmin);
      
      setSnackbar({
        open: true,
        message: `Welcome ${result.user.displayName}!`,
        severity: 'success'
      });

      if (isAdmin) {
        console.log('Navigating to admin dashboard');
        navigate('/dashboard');
      } else {
        console.log('Navigating to user dashboard');
        navigate('/user-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          backgroundColor: theme.palette.primary.main,
          opacity: 0.1,
          top: '-100px',
          right: '-100px'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          backgroundColor: theme.palette.primary.main,
          opacity: 0.1,
          bottom: '-50px',
          left: '-50px'
        }}
      />

      <Container maxWidth="sm">
        <Grid container spacing={3} direction="column" alignItems="center">
          <Grid item>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                mb: 2
              }}
            >
              <Box
                component="img"
                src={logorsage}
                alt="RouteSage Logo"
                sx={{
                  width: '200px',
                  height: 'auto',
                  mb: 2
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                width: '100%',
                borderRadius: 2,
                bgcolor: 'background.paper',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  bgcolor: theme.palette.primary.main
                }}
              />
              
              <Typography variant="h5" align="center" gutterBottom>
                RouteSage Admin
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                align="center"
                sx={{ mb: 4 }}
              >
                Sign in to access your dashboard
              </Typography>

              <Button
                fullWidth
                size="large"
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                disabled={loading}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  borderRadius: 2,
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px'
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Continue with Google'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            boxShadow: theme.shadows[3]
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login; 