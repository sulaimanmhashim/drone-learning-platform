// ======= MOCKS SAFELY INSIDE vi.mock() FACTORIES =======

// ========== SAFE MOCK OF firebaseConfig ==========
vi.mock('../../firebase/firebaseConfig', () => ({
  auth: {},
  db: {}
}));

// ========== OTHER SAFE FIREBASE MOCKS ==========

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(() => ({})),
    doc: vi.fn(() => ({})),
    query: vi.fn(() => ({})),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    serverTimestamp: () => new Date(),
  };
});

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    signOut: vi.fn(),
    getAuth: vi.fn(() => ({})),
    GoogleAuthProvider: vi.fn(() => ({})),
    signInWithPopup: vi.fn()
  };
});

// ========== CONTEXT MOCK ==========
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      uid: 'user123',
      displayName: 'Participant One',
      email: 'participant@example.com'
    },
    userRole: 'participant'
  }),
}));

// ========== REACT ROUTER DOM MOCK ==========
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: actual.BrowserRouter
  };
});

// ======= IMPORTS AFTER MOCKS =======
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import GroupPortal from './GroupPortal';
import { BrowserRouter } from 'react-router-dom';
import * as firestore from 'firebase/firestore';

// ======= CLEANUP =======
afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

// ======= HELPER =======
function renderGroupPortal() {
  render(
    <BrowserRouter>
      <GroupPortal />
    </BrowserRouter>
  );
}

// ======= TESTS =======

test('renders create and join group UI when not in a group', async () => {
  vi.spyOn(firestore, 'getDocs').mockResolvedValueOnce({
    docs: [
      {
        id: 'group1',
        data: () => ({ groupName: 'Alpha Team', members: ['user456'] })
      }
    ]
  });

  renderGroupPortal();

  await waitFor(() => {
    expect(screen.getByText(/Create a Group/i)).toBeInTheDocument();
    expect(screen.getByText(/Join Existing Group/i)).toBeInTheDocument();
    expect(screen.getByText(/Alpha Team/i)).toBeInTheDocument();
  });
});

test('creates a new group and displays it as existing group', async () => {
  vi.spyOn(firestore, 'getDocs').mockResolvedValueOnce({ docs: [] });
  vi.spyOn(firestore, 'addDoc').mockResolvedValueOnce({ id: 'group123' });

  renderGroupPortal();

  fireEvent.change(screen.getByPlaceholderText(/group name/i), {
    target: { value: 'Bravo Squad' }
  });

  fireEvent.click(screen.getByText(/Create Group/i));

  await waitFor(() => {
    expect(firestore.addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      groupName: 'Bravo Squad',
      members: ['user123']
    }));
    expect(screen.getByText(/Your Group/i)).toBeInTheDocument();
    expect(screen.getByText(/Bravo Squad/i)).toBeInTheDocument();
  });
});

test('joins an existing group and updates UI', async () => {
  const groupDoc = {
    id: 'group2',
    data: () => ({
      groupName: 'Charlie Unit',
      members: ['user456']
    })
  };

  vi.spyOn(firestore, 'getDocs')
    .mockResolvedValueOnce({ docs: [groupDoc] }) // initial render
    .mockResolvedValueOnce({ docs: [groupDoc] }); // after join

  vi.spyOn(firestore, 'updateDoc').mockResolvedValue();

  renderGroupPortal();

  await waitFor(() => {
    expect(screen.getByText(/Charlie Unit/i)).toBeInTheDocument();
  });

  const joinButtons = screen.getAllByText(/Join/i);
  const joinButton = joinButtons.find(btn => btn.tagName === 'BUTTON');

  fireEvent.click(joinButton);



  await waitFor(() => {
    expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), {
      members: ['user456', 'user123']
    });

    expect(screen.getByText(/Your Group/i)).toBeInTheDocument();
    expect(screen.getByText(/Charlie Unit/i)).toBeInTheDocument();
  });
});
