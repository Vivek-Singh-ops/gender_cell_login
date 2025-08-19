import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console or external service
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">Something went wrong</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
          </Alert>
          <Button variant="contained" onClick={this.handleReset}>
            Try Again
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => window.location.href = '/'}
            sx={{ ml: 2 }}
          >
            Go Home
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;