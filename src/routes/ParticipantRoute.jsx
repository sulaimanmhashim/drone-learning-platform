import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ParticipantRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return null; 
  if (!currentUser || userRole !== 'participant') return <Navigate to="/" />;

  return children;
}
