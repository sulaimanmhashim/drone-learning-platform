import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export default function ViewProfile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const ref = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile(snap.data());
        setDisplayName(snap.data().displayName || '');
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { displayName });
      alert('Profile updated');
    } catch (err) {
      alert('Failed to update');
      console.error(err);
    }
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Profile</h2>
      <p><strong>Email:</strong> {currentUser.email}</p>

      <label htmlFor="displayName"><strong>Display Name:</strong></label><br />
      <input
        id="displayName"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        style={{ marginBottom: '1rem', width: '100%' }}
      />
      <br />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}