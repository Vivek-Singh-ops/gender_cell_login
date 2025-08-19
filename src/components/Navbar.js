import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Role-Based Auth
        </Typography>
        <Box>
          {currentUser ? (
            <>
              {currentUser.role === 'admin' && (
                <Button color="inherit" component={Link} to="/admin">
                  Admin Dashboard
                </Button>
              )}
              <Button color="inherit" component={Link} to="/member">
                Member Dashboard
              </Button>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;