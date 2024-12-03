import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 'sm',
            bgcolor: 'background.paper',
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom color="error">
            Access Restricted
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            This portal is only accessible to administrators. If you believe you should have admin access, please contact the RouteSage Team.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Logged in as: {user?.email}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogout}
            sx={{ mt: 2 }}
          >
            Logout
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default UserDashboard; 