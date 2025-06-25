import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function CoordinatorRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return null;
  if (!currentUser || userRole !== 'coordinator') return <Navigate to="/" />;

  return children;
}
