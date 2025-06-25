import { useAuth } from '../../contexts/AuthContext';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useEffect, useState } from 'react';

export default function ProjectPortal() {
  const { currentUser, userRole } = useAuth();

  const [group, setGroup] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [coordinatorProposals, setCoordinatorProposals] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coordinators, setCoordinators] = useState([]);
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState('');
  const [progress, setProgress] = useState('');

  // Fetch participant's group
  useEffect(() => {
    if (userRole !== 'participant') return;

    const fetchGroup = async () => {
      const snapshot = await getDocs(collection(db, 'groups'));
      const allGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const userGroup = allGroups.find(group => group.members.includes(currentUser.uid));
      setGroup(userGroup || null);
    };

    fetchGroup();
  }, [currentUser.uid, userRole]);

  // Fetch proposal for participant's group
  useEffect(() => {
    if (userRole !== 'participant' || !group) return;

    const fetchProposal = async () => {
      const q = query(collection(db, 'projectProposals'), where('groupId', '==', group.id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const proposalData = { id: doc.id, ...doc.data() };
        setProposal(proposalData);
      } else {
        setProposal(null);
      }
    };

    fetchProposal();
  }, [group, userRole]);

  // Fetch coordinators
  useEffect(() => {
    if (userRole !== 'participant') return;

    const fetchCoordinators = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'coordinator'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoordinators(list);
    };

    fetchCoordinators();
  }, [userRole]);

  // Handle proposal submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !selectedCoordinatorId || !group) return;

    await addDoc(collection(db, 'projectProposals'), {
      participantId: currentUser.uid,
      groupId: group.id,
      coordinatorId: selectedCoordinatorId,
      title,
      description,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    setTitle('');
    setDescription('');
    setSelectedCoordinatorId('');
    setProposal(null);
  };

  // Handle progress update
  const handleProgressUpdate = async () => {
    if (!progress || !proposal?.id) return;
    await updateDoc(doc(db, 'projectProposals', proposal.id), {
      progress,
      updatedAt: serverTimestamp()
    });
    alert('Progress updated.');
    setProposal(prev => ({ ...prev, progress }));
    setProgress('');
  };

  // Fetch proposals assigned to coordinator
  useEffect(() => {
    if (userRole !== 'coordinator') return;

    const fetchAssigned = async () => {
      const q = query(collection(db, 'projectProposals'), where('coordinatorId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoordinatorProposals(result);
    };

    fetchAssigned();
  }, [currentUser.uid, userRole]);

  // Coordinator updates status
  const handleStatusChange = async (id, newStatus) => {
    await updateDoc(doc(db, 'projectProposals', id), { status: newStatus });
    setCoordinatorProposals(prev =>
      prev.map(p => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  // ================= Participant View =================
  if (userRole === 'participant') {
    if (proposal) {
      return (
        <div style={{ padding: '2rem' }}>
          <h2>Project Proposal</h2>
          <h3>Submitted Proposal</h3>
          <p><strong>Title:</strong> {proposal.title}</p>
          <p><strong>Description:</strong> {proposal.description}</p>
          <p><strong>Status:</strong> {proposal.status}</p>
          {proposal.progress && (
            <p><strong>Current Progress:</strong> {proposal.progress}</p>
          )}

          <div>
            <label htmlFor="progress"><strong>Update Progress:</strong></label><br />
            <textarea
              id="progress"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              rows={3}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <button onClick={handleProgressUpdate}>Submit Progress</button>
          </div>
        </div>
      );
    }

    if (group) {
      return (
        <div style={{ padding: '2rem' }}>
          <h2>Project Proposal</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title">Project Title</label><br />
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', marginBottom: '0.5rem' }}
              />
            </div>
            <div>
              <label htmlFor="description">Description</label><br />
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{ width: '100%', marginBottom: '0.5rem' }}
              />
            </div>
            <div>
              <label htmlFor="coordinator">Coordinator</label><br />
              <select
                id="coordinator"
                value={selectedCoordinatorId}
                onChange={(e) => setSelectedCoordinatorId(e.target.value)}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                <option value="">Select a coordinator</option>
                {coordinators.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.displayName || c.email}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit">Submit Proposal</button>
          </form>
        </div>
      );
    }

    return (
      <div style={{ padding: '2rem' }}>
        <h2>Project Proposal</h2>
        <p>You must be in a group to submit a project proposal.</p>
      </div>
    );
  }

  // ================= Coordinator View =================
  if (userRole === 'coordinator') {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Proposals Assigned to You</h2>

        {coordinatorProposals.length === 0 ? (
          <p>No proposals found.</p>
        ) : (
          coordinatorProposals.map(p => (
            <div
              key={p.id}
              style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}
            >
              <p><strong>Title:</strong> {p.title}</p>
              <p><strong>Description:</strong> {p.description}</p>
              <p><strong>Group ID:</strong> {p.groupId}</p>
              <p><strong>Status:</strong> {p.status}</p>
              {p.progress && (
                <p><strong>Progress Update:</strong> {p.progress}</p>
              )}

              <div>
                <label htmlFor={`status-${p.id}`}>Update Status:</label><br />
                <select
                  id={`status-${p.id}`}
                  value={p.status}
                  onChange={(e) => handleStatusChange(p.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return null;
}
