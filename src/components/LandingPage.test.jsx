const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock firebase/auth safely
vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');

  return {
    ...actual,
    GoogleAuthProvider: vi.fn(() => ({})),
    signInWithPopup: vi.fn(),
    getAuth: vi.fn(() => ({ fake: 'auth' })) // prevent getProvider crash
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


// AFTER mocks and BEFORE tests, import mocked implementations
import { signInWithPopup } from 'firebase/auth';
import { getDoc, setDoc } from 'firebase/firestore';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

afterEach(() => {
  vi.clearAllMocks();
});

function renderPage() {
  render(
    <BrowserRouter>
      <LandingPage />
    </BrowserRouter>
  );
}

test('renders welcome and sign-in button', () => {
  renderPage();
  expect(screen.getByText(/Welcome to Drone Learning Platform/i)).toBeInTheDocument();
  expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
});

test('navigates to participant for new user', async () => {
  signInWithPopup.mockResolvedValue({
    user: { uid: 'user123', email: 'user@example.com', displayName: 'New User' }
  });

  getDoc
    .mockResolvedValueOnce({ exists: () => false }) // user doesn't exist
    .mockResolvedValueOnce({ exists: () => true, data: () => ({ role: 'participant' }) }); // after setDoc

  renderPage();
  fireEvent.click(screen.getByText(/Sign in with Google/i));

  await waitFor(() => {
    expect(setDoc).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/participant');
  });
});

test('navigates to coordinator for existing user', async () => {
  signInWithPopup.mockResolvedValue({
    user: { uid: 'admin456', email: 'admin@example.com', displayName: 'Coordinator' }
  });

  getDoc.mockResolvedValue({
    exists: () => true,
    data: () => ({ role: 'coordinator' })
  });

  renderPage();
  fireEvent.click(screen.getByText(/Sign in with Google/i));

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/coordinator');
  });
});

test('handles sign-in failure gracefully', async () => {
  const error = new Error('Popup closed');
  signInWithPopup.mockRejectedValue(error);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  window.alert = vi.fn();

  renderPage();
  fireEvent.click(screen.getByText(/Sign in with Google/i));

  await waitFor(() => {
    expect(console.error).toHaveBeenCalledWith('Google sign-in error:', 'Popup closed');
    expect(window.alert).toHaveBeenCalledWith('Authentication failed. Please try again.');
  });
});
