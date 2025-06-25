import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth } from '../firebase/firebaseConfig';
import { db } from '../firebase/firebaseConfig';
import Loader from './UI/Loader';

export default function LandingPage() {
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      let userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || '',
          role: 'participant',
          createdAt: new Date()
        });

        // Re-fetch to ensure consistency
        userDoc = await getDoc(userRef);
      }

      const role = userDoc.data().role;
      if (role === 'coordinator') {
        navigate('/coordinator');
      } else {
        navigate('/participant');
      }

    } catch (err) {
      console.error('Google sign-in error:', err.message);
      alert('Authentication failed. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt('Please enter your email address:');
    if (!email) return;

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.includes('google.com')) {
        alert(
          'This email is registered via Google. Please reset your password '+
          'through your Google Account: https://myaccount.google.com/security.'
        );
      } else if (methods.includes('password')) {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent.');
      } else {
        alert('No account found for this email.');
      }
    } catch (error) {
      console.error(error);
      alert('Error sending reset email. Please try again.');
    }
  };


  return (
    <div className="fullscreen-center">
      {signingIn ? (
        <Loader message="Signing you in..." />
      ) : (
        <>
          <h1>Welcome to Drone Learning Platform</h1>
          <p className="lead mb-4">Sign in with your Google account to get started</p>
          <button className="button" onClick={handleGoogleSignIn}>
            Sign in with Google
          </button>
          <button onClick={handleForgotPassword}>Reset Password</button>
        </>
      )}
    </div>
  );
}
