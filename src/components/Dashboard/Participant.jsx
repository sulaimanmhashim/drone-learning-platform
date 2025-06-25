import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';

export default function Participant() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (typeof navigate === 'function') {
        navigate('/login');
      } else {
        console.warn('Navigate is not a function');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Participant Dashboard</h2>
      <p>Welcome, {currentUser?.displayName || currentUser?.email}</p>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
