import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import AuthRoute from './components/AuthRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import TableEditor from './pages/TableEditor';
import AdminDashboard from './pages/Admin/Dashboard';
import MemberDashboard from './pages/Member/Dashboard';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/admin" element={
                <AuthRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </AuthRoute>
              } />
              
              <Route path="/member" element={
                <AuthRoute allowedRoles={['member', 'admin']}>
                  <MemberDashboard />
                </AuthRoute>
              } />
              
              <Route path="/table/:itemId" element={
                <AuthRoute allowedRoles={['member', 'admin']}>
                  <TableEditor />
                </AuthRoute>
              } />
            </Routes>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
