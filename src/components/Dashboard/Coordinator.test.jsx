import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: actual.BrowserRouter
  };
});

// Mock firebase/auth safely
vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');

  return {
    ...actual,
    GoogleAuthProvider: vi.fn(() => ({})),
    signInWithPopup: vi.fn(),
    getAuth: vi.fn(() => ({ fake: 'auth' })),
    signOut: vi.fn(() => Promise.resolve())
  };
});


// Mock firebase/firestore safely
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');

  return {
    ...actual,
    doc: vi.fn(() => ({})),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    getFirestore: vi.fn(() => ({ fake: 'firestore' })), // Prevents getProvider crash
    collection: vi.fn(),
  };
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      displayName: 'Dr. Coordinator',
      email: 'coord@example.com'
    },
    userRole: 'coordinator'
  })
}));

// THEN: Import test libraries and component
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Coordinator from './Coordinator';
import { signOut } from 'firebase/auth';

// Cleanup mocks
afterEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
});

// Helper render function
function renderPage() {
  render(
    <BrowserRouter>
      <Coordinator />
    </BrowserRouter>
  );
}

// Tests
test('renders coordinator dashboard and welcome message', () => {
  renderPage();

  expect(screen.getByText(/Coordinator Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Welcome, Dr. Coordinator/i)).toBeInTheDocument();
  expect(screen.getByText(/Manage Lessons/i)).toBeInTheDocument();
  expect(screen.getByText(/Review Projects/i)).toBeInTheDocument();
});

test('calls signOut and navigates on logout', async () => {
  renderPage();

  const logoutBtn = screen.getByText('Logout');
  fireEvent.click(logoutBtn);

  await waitFor(() => {
    expect(signOut).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

});
