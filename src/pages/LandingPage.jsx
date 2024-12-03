import { Box, Button, Container, Grid, Typography, Paper, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import MapIcon from '@mui/icons-material/Map';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import AndroidIcon from '@mui/icons-material/Android';
import DownloadIcon from '@mui/icons-material/Download';
import logorsage from '../assets/logorsage.png';

const FeatureCard = ({ icon, title, description }) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        backgroundColor: 'transparent',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
        },
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        {icon}
        <Typography variant="h6" component="h3" align="center" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          {description}
        </Typography>
      </Box>
    </Paper>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleDownloadAPK = () => {
    // Replace this URL with your actual APK download link
    const apkUrl = 'https://drive.google.com/file/d/14PftpFRtD7rr546cbEjdDU0KirNSznql/view?usp=sharing';
    window.open(apkUrl, '_blank');
  };

  const features = [
    {
      icon: <DirectionsBusIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Vehicle Management',
      description: 'Efficiently manage your fleet with real-time tracking and maintenance scheduling.'
    },
    {
      icon: <MapIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Route Optimization',
      description: 'Optimize routes for maximum efficiency and reduced fuel consumption.'
    },
    {
      icon: <PaymentIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Fare Management',
      description: 'Streamline fare collection and management with automated systems.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Secure Access',
      description: 'Role-based access control ensures data security and proper authorization.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 12,
          pb: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={logorsage}
                alt="RouteSage Logo"
                sx={{
                  width: '300px',
                  height: 'auto',
                  mb: 4,
                  display: 'block'
                }}
              />
              <Typography
                variant="h5"
                color="text.secondary"
                paragraph
                sx={{ mb: 4 }}
              >
                Your comprehensive solution for efficient transportation management. Streamline operations, optimize routes, and enhance passenger experience.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderRadius: 2
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleDownloadAPK}
                  startIcon={<AndroidIcon />}
                  endIcon={<DownloadIcon />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderRadius: 2,
                    borderWidth: '2px',
                    '&:hover': {
                      borderWidth: '2px'
                    }
                  }}
                >
                  Download App
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/hero-image.svg"
                alt="Transportation Management"
                sx={{
                  width: '100%',
                  maxWidth: 600,
                  height: 'auto',
                  display: 'block',
                  margin: 'auto'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Typography
          variant="h3"
          align="center"
          color="text.primary"
          sx={{ mb: 8, fontWeight: 700 }}
        >
          Key Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Download Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 2,
              bgcolor: theme.palette.grey[50],
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="h4" gutterBottom fontWeight="700">
                  Get the RouteSage Mobile App
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Download our Android app to manage your transportation operations on the go. Access all features directly from your mobile device.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleDownloadAPK}
                  startIcon={<AndroidIcon />}
                  endIcon={<DownloadIcon />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderRadius: 2
                  }}
                >
                  Download APK
                </Button>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                  }}
                >
                  <AndroidIcon
                    sx={{
                      fontSize: '200px',
                      color: theme.palette.primary.main,
                      opacity: 0.8
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.grey[100]
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} RouteSage. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 