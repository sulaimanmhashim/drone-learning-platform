import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';

export default function Navbar() {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!currentUser) return null; // Hide navbar on landing/login

  return (
    <header className="horizontal-navbar">
      <div className="nav-logo">Drone Learning</div>

      <nav className="nav-links">
        {userRole === 'participant' && (
          <>
            <NavLink to="/participant">Dashboard</NavLink>
            <NavLink to="/lessons">Lessons</NavLink>
            <NavLink to="/participant/groups">Groups</NavLink>
            <NavLink to="/projects">Proposal</NavLink>
            <NavLink to="/quiz/results">Quiz Results</NavLink>
            <NavLink to="/profile">Profile</NavLink>
          </>
        )}

        {userRole === 'coordinator' && (
          <>
            <NavLink to="/coordinator">Dashboard</NavLink>
            <NavLink to="/lessons">Lessons</NavLink>
            <NavLink to="/coordinator/quiz">Quiz Builder</NavLink>
            <NavLink to="/projects">Proposals</NavLink>
            <NavLink to="/coordinator/report">Reports</NavLink>
            <NavLink to="/profile">Profile</NavLink>
          </>
        )}

        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>
    </header>

  );
}
