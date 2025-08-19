import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthRoute({ children, allowedRoles }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (currentUser.status !== 'approved') {
    return <Navigate to="/login" state={{ message: 'Your account is pending approval' }} />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default AuthRoute;