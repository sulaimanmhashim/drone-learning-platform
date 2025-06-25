import { useAuth } from '../../contexts/AuthContext';
import {
  collection,
  addDoc,
  query,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useEffect, useState } from 'react';

export default function GroupPortal() {
  const { currentUser } = useAuth();

  const [groupName, setGroupName] = useState('');
  const [existingGroup, setExistingGroup] = useState(null);
  const [joinGroupId, setJoinGroupId] = useState('');
  const [groups, setGroups] = useState([]);

  const groupsRef = collection(db, 'groups');

  // Fetch all groups to show for join options
  useEffect(() => {
    const fetchGroups = async () => {
      const q = query(groupsRef);
      const snapshot = await getDocs(q);
      const groupData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGroups(groupData);

      // Check if current user is already in a group
      const userGroup = groupData.find(g => g.members.includes(currentUser.uid));
      setExistingGroup(userGroup || null);
    };

    fetchGroups();
  }, [currentUser.uid]);

  const createGroup = async () => {
    if (!groupName) return;
    const newGroup = {
      groupName,
      members: [currentUser.uid],
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(groupsRef, newGroup);
    setExistingGroup({ id: docRef.id, ...newGroup });
    setGroupName('');
  };

  const joinGroup = async (groupId) => {
    const groupDoc = doc(db, 'groups', groupId);
    const groupSnap = await getDocs(groupsRef);
    const group = groupSnap.docs.find(doc => doc.id === groupId);

    if (!group || typeof group.data !== 'function') return alert('Group not found.');

    const groupData = group.data();
    if (groupData.members.includes(currentUser.uid)) {
      return alert('You are already in this group.');
    }

    await updateDoc(groupDoc, {
      members: [...groupData.members, currentUser.uid]
    });

    setExistingGroup({ id: groupId, ...groupData, members: [...groupData.members, currentUser.uid] });
    setJoinGroupId('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Project Group</h2>

      {existingGroup ? (
        <>
          <h3>Your Group</h3>
          <p><strong>Name:</strong> {existingGroup.groupName}</p>
          <p><strong>Members:</strong></p>
          <ul>
            {existingGroup.members.map((uid, i) => (
              <li key={i}>{uid === currentUser.uid ? `${uid} (you)` : uid}</li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h3>Create a Group</h3>
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <button onClick={createGroup}>Create Group</button>
          </div>

          <div>
            <h3>Join Existing Group</h3>
            <ul style={{ padding: 0, listStyle: 'none' }}>
              {groups.map(group => (
                <li key={group.id} style={{ marginBottom: '1rem' }}>
                  <strong>{group.groupName}</strong>
                  <button
                    onClick={() => joinGroup(group.id)}
                    style={{ marginLeft: '1rem' }}
                  >
                    Join
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
