// ====== Mocks ======
vi.mock('../../contexts/AuthContext', () => {
  return {
    useAuth: vi.fn()
  };
});

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    getAuth: vi.fn(() => ({})),
    signOut: vi.fn(() => Promise.resolve())
  };
});

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate
  };
});

import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';


afterEach(() => {
  vi.clearAllMocks();
});

function renderWithContext(role = 'participant') {
  useAuth.mockReturnValue({
    currentUser: { uid: 'user1' },
    userRole: role
  });

  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
}

test('hides navbar if no user is logged in', () => {
  useAuth.mockReturnValue({ currentUser: null, userRole: null });

  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );

  expect(screen.queryByText(/Drone Learning/i)).not.toBeInTheDocument();
});

test('renders participant navbar links', () => {
  renderWithContext('participant');

  expect(screen.getByText(/Drone Learning/i)).toBeInTheDocument();
  expect(screen.getByText(/Dashboard/i)).toHaveAttribute('href', '/participant');
  expect(screen.getByText(/Lessons/i)).toHaveAttribute('href', '/lessons');
  expect(screen.getByText(/Groups/i)).toHaveAttribute('href', '/participant/groups');
  expect(screen.getByText(/Proposal/i)).toHaveAttribute('href', '/projects');
  expect(screen.getByText(/Quiz Results/i)).toHaveAttribute('href', '/quiz/results');
});

test('renders coordinator navbar links', () => {
  renderWithContext('coordinator');

  expect(screen.getByText(/Dashboard/i)).toHaveAttribute('href', '/coordinator');
  expect(screen.getByText(/Lessons/i)).toHaveAttribute('href', '/lessons');
  expect(screen.getByText(/Quiz Builder/i)).toHaveAttribute('href', '/coordinator/quiz');
  expect(screen.getByText(/Proposals/i)).toHaveAttribute('href', '/projects');
});

test('logout button signs out and navigates to /', async () => {
  renderWithContext('participant');

  const logoutButton = screen.getByText(/Logout/i);
  fireEvent.click(logoutButton);

  await Promise.resolve(); // flush promises
  expect(signOut).toHaveBeenCalled();
  expect(mockedNavigate).toHaveBeenCalledWith('/');
});
