// ViewProfile.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ViewProfile from './ViewProfile';

// Firestore mocks MUST be declared inside vi.mock to avoid hoisting issues
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');

  // Fully functional mock Firestore snapshot
  const mockSnapshot = {
    exists: () => true,
    data: () => ({ displayName: 'Test User' }),
  };

  const mockGetDoc = vi.fn(() => Promise.resolve(mockSnapshot));
  const mockUpdateDoc = vi.fn(() => Promise.resolve());

  // Make mocks globally accessible
  globalThis.__mockFirestore__ = { mockGetDoc, mockUpdateDoc };

  return {
    ...actual,
    doc: vi.fn(() => ({})),
    getDoc: mockGetDoc,
    updateDoc: mockUpdateDoc,
  };
});

vi.mock('../firebase/firebaseConfig', () => ({
  db: {},
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      uid: 'user123',
      email: 'testuser@example.com',
    },
  }),
}));

afterEach(() => {
  vi.resetAllMocks();
});

function renderWithRouter() {
  render(
    <BrowserRouter>
      <ViewProfile />
    </BrowserRouter>
  );
}

test('renders loading state then displays profile', async () => {
  renderWithRouter();

  expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  expect(await screen.findByDisplayValue('Test User')).toBeInTheDocument();
  expect(screen.getByText(/testuser@example.com/i)).toBeInTheDocument();
});

test('updates display name when Save is clicked', async () => {
  const { mockUpdateDoc } = globalThis.__mockFirestore__;

  renderWithRouter();

  const input = await screen.findByDisplayValue('Test User');
  fireEvent.change(input, { target: { value: 'Updated Name' } });
  fireEvent.click(screen.getByText(/save/i));

  await waitFor(() => {
    expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), {
      displayName: 'Updated Name',
    });
  });
});
