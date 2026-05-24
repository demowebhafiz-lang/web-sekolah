import { Navigate, useLocation } from 'react-router-dom';
import AccessDeniedPage from '../features/shared/AccessDeniedPage.jsx';
import { getStoredUser, isAuthenticated } from '../features/auth/authService.js';
import { canAccess } from '../features/auth/roles.js';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const location = useLocation();
  const user = getStoredUser();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccess(user?.role, allowedRoles)) {
    return <AccessDeniedPage />;
  }

  return children;
}
