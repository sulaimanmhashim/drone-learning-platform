// Mock Firestore safely
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');

  const mockGetDocs = vi.fn();
  const mockGetDoc = vi.fn();

  // Store mocks globally so tests can access
  globalThis.__mockFirestore__ = {
    mockGetDocs,
    mockGetDoc,
  };

  return {
    ...actual,
    collection: vi.fn(() => ({})),
    query: vi.fn(),
    where: vi.fn(),
    doc: vi.fn((_, __, id) => ({ id })),
    getDocs: mockGetDocs,
    getDoc: mockGetDoc,
    serverTimestamp: () => new Date(),
  };
});

vi.mock('../../firebase/firebaseConfig', () => ({
  db: {},
  auth: {}
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'participant1' }
  })
}));

import { render, screen, waitFor } from '@testing-library/react';
import QuizResultViewer from './QuizResultViewer';
import { BrowserRouter } from 'react-router-dom';

afterEach(() => {
  vi.resetAllMocks();
});

test('shows message if no quiz results exist', async () => {
  const { mockGetDocs } = globalThis.__mockFirestore__;
  mockGetDocs.mockResolvedValueOnce({ docs: [] });

  render(
    <BrowserRouter>
      <QuizResultViewer />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/You haven't submitted any quizzes yet/i)).toBeInTheDocument();
  });
});

test('renders quiz result with correct and incorrect answers', async () => {
  const { mockGetDocs, mockGetDoc } = globalThis.__mockFirestore__;

  mockGetDocs.mockResolvedValueOnce({
    docs: [
      {
        id: 'res1',
        data: () => ({
          quizId: 'quiz1',
          lessonId: 'lesson123',
          score: 1,
          answers: ['4', 'Berlin'],
          submittedAt: {
            toDate: () => new Date('2023-10-10T12:00:00')
          }
        })
      }
    ]
  });

  mockGetDoc.mockResolvedValueOnce({
    exists: () => true,
    data: () => ({
      questions: [
        {
          question: 'What is 2 + 2?',
          options: ['3', '4'],
          answer: '4'
        },
        {
          question: 'Capital of France?',
          options: ['Berlin', 'Paris'],
          answer: 'Paris'
        }
      ]
    })
  });

  render(
    <BrowserRouter>
      <QuizResultViewer />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/Your Quiz Results/i)).toBeInTheDocument();
    expect(screen.getByText(/Lesson ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/Score:/i)).toBeInTheDocument();
    const correctLabels = screen.getAllByText(/Correct/i);
    expect(correctLabels.length).toBeGreaterThan(0);
    expect(screen.getByText(/Incorrect/i)).toBeInTheDocument();
    expect(screen.getByText(/What is 2 \+ 2\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Capital of France\?/i)).toBeInTheDocument();
  });
});

