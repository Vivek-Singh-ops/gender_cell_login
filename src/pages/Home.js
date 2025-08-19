import { useAuth } from '../context/AuthContext';
import { Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Home() {
  const { currentUser } = useAuth();

  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>
        Welcome to Role-Based Authentication System
      </Typography>
      {currentUser ? (
        <Typography variant="h5">
          You are logged in as {currentUser.name} ({currentUser.role})
        </Typography>
      ) : (
        <Box sx={{ mt: 4 }}>
          <Button 
            variant="contained" 
            size="large" 
            component={Link} 
            to="/login"
            sx={{ mr: 2 }}
          >
            Login
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            component={Link} 
            to="/register"
          >
            Register
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default Home;