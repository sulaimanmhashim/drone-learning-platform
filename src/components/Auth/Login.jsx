import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || '',
          role: 'participant', // Default role
          createdAt: new Date()
        });
        navigate('/participant');
      } else {
        const role = docSnap.data().role;
        navigate(role === 'coordinator' ? '/coordinator' : '/participant');
      }
    } catch (err) {
      console.error('Google login failed:', err.message);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '1rem' }}>
      <h2>Sign in</h2>
      <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '0.5rem', marginTop: '1rem' }}>
        Sign in with Google
      </button>
    </div>
  );
}
