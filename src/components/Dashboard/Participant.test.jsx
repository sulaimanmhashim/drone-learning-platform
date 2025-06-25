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

// Mock useAuth from context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      displayName: 'Participant One',
      email: 'participant@example.com'
    },
    userRole: 'participant'
  })
}));

// AFTER mocks, import modules
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Participant from './Participant';
import { signOut } from 'firebase/auth';

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
});

// Helper render function
const renderPage = () => {
  render(
    <BrowserRouter>
      <Participant />
    </BrowserRouter>
  );
};

test('renders participant dashboard with welcome message', () => {
  renderPage();

  expect(screen.getByText(/Participant Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Welcome, Participant One/i)).toBeInTheDocument();
});

test('calls signOut and navigates on logout', async () => {
  renderPage();

  fireEvent.click(screen.getByText(/logout/i));

  await waitFor(() => {
    expect(signOut).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
