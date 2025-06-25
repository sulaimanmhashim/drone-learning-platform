// ========== Mocks ==========

vi.mock('../../firebase/firebaseConfig', () => ({
  auth: {},
  db: {}
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(() => ({})),
    query: vi.fn(() => ({})),
    orderBy: vi.fn(() => ({})),
    doc: vi.fn(() => ({})),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    deleteDoc: vi.fn(),
    updateDoc: vi.fn(),
    serverTimestamp: () => new Date()
  };
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'coord123' },
    userRole: 'coordinator',
  }),
}));

// ========== Imports ==========
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LessonPortal from './LessonPortal';
import { BrowserRouter } from 'react-router-dom';
import * as firestore from 'firebase/firestore';

// ========== Cleanup ==========
afterEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
});

// ========== Helper ==========
function renderPage() {
  render(
    <BrowserRouter>
      <LessonPortal />
    </BrowserRouter>
  );
}

// ========== Tests ==========

test('renders lesson manager and displays lessons', async () => {
  vi.spyOn(firestore, 'getDocs').mockResolvedValueOnce({
    docs: [
      {
        id: 'lesson1',
        data: () => ({
          title: 'Drone Basics',
          level: 'beginner',
          content: 'Intro to drone flight',
          resource: 'https://example.com',
          coordinatorId: 'coord123',
        }),
      },
    ],
  });

  renderPage();

  await waitFor(() => {
    expect(screen.getByText('Lesson Manager')).toBeInTheDocument();
    expect(screen.getByText('Drone Basics')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });
});

test('adds a new lesson', async () => {
  vi.spyOn(firestore, 'getDocs')
    .mockResolvedValueOnce({ docs: [] }) // initial fetch
    .mockResolvedValueOnce({
      docs: [
        {
          id: 'newLessonId',
          data: () => ({
            title: 'Advanced Control',
            level: 'advanced',
            content: 'Detailed control systems',
            resource: '',
            coordinatorId: 'coord123',
          }),
        },
      ],
    });

  const addDocSpy = vi.spyOn(firestore, 'addDoc').mockResolvedValueOnce({ id: 'newLessonId' });

  renderPage();

  fireEvent.change(screen.getByPlaceholderText(/Title/i), {
    target: { value: 'Advanced Control' },
  });

  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: 'advanced' },
  });


  fireEvent.change(screen.getByPlaceholderText(/Lesson Content/i), {
    target: { value: 'Detailed control systems' },
  });

  fireEvent.click(screen.getByText(/Add Lesson/i));

  await waitFor(() => {
    expect(addDocSpy).toHaveBeenCalled();
    expect(screen.getByText('Advanced Control')).toBeInTheDocument();
  });
});

test('deletes a lesson', async () => {
  vi.spyOn(firestore, 'getDocs').mockResolvedValueOnce({
    docs: [
      {
        id: 'lesson2',
        data: () => ({
          title: 'Regulations',
          level: 'intermediate',
          content: 'Legal responsibilities',
          resource: '',
          coordinatorId: 'coord123',
        }),
      },
    ],
  });

  const deleteDocSpy = vi.spyOn(firestore, 'deleteDoc').mockResolvedValueOnce();

  renderPage();

  await waitFor(() => {
    expect(screen.getByText('Regulations')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText(/Delete/i));

  await waitFor(() => {
    expect(deleteDocSpy).toHaveBeenCalled();
  });
});

test('edits a lesson', async () => {
  // First getDocs call (initial render)
  vi.spyOn(firestore, 'getDocs').mockResolvedValueOnce({
    docs: [
      {
        id: 'lesson3',
        data: () => ({
          title: 'Flight Modes',
          level: 'intermediate',
          content: 'Understanding modes',
          resource: 'https://example.com',
          coordinatorId: 'coord123',
        }),
      },
    ],
  });

  // Second getDocs call (after update)
  vi.spyOn(firestore, 'getDocs').mockResolvedValueOnce({
    docs: [
      {
        id: 'lesson3',
        data: () => ({
          title: 'Flight Techniques',
          level: 'intermediate',
          content: 'Understanding modes',
          resource: 'https://example.com',
          coordinatorId: 'coord123',
        }),
      },
    ],
  });

  const updateDocSpy = vi.spyOn(firestore, 'updateDoc').mockResolvedValue();

  renderPage();

  await waitFor(() => {
    expect(screen.getByText('Flight Modes')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText(/Edit/i));

  fireEvent.change(screen.getByDisplayValue('Flight Modes'), {
    target: { value: 'Flight Techniques' },
  });

  fireEvent.click(screen.getByText(/Save/i));

  await waitFor(() => {
    expect(updateDocSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      title: 'Flight Techniques',
    }));
    expect(screen.getByText('Flight Techniques')).toBeInTheDocument(); // optional validation
  });
});

