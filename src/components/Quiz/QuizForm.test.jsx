// ====== Firebase App Mock ======
vi.mock('firebase/app', async () => ({
  initializeApp: vi.fn(() => ({ mockApp: true })),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({ mockApp: true }))
}));

// ====== Firebase Config Mock ======
vi.mock('../../firebase/firebaseConfig', () => ({
  db: {}, // avoid getFirestore(app)
  auth: {}
}));

// ====== Firebase Firestore Mock ======
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(() => ({})),
    where: vi.fn(() => ({})),
    query: vi.fn(() => ({})),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    serverTimestamp: () => new Date()
  };
});

// ====== Auth Context Mock ======
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'participant1' },
    userRole: 'participant',
    loading: false
  })
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuizForm from './QuizForm';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import * as firestore from 'firebase/firestore';

afterEach(() => {
  vi.resetAllMocks();
});

function renderWithRoute(lessonId = 'lesson123') {
  return render(
    <MemoryRouter initialEntries={[`/quiz/${lessonId}`]}>
      <Routes>
        <Route path="/quiz/:lessonId" element={<QuizForm />} />
      </Routes>
    </MemoryRouter>
  );
}

test('renders quiz and allows user to submit answers', async () => {
  const mockQuizDoc = {
    id: 'quiz1',
    data: () => ({
      lessonId: 'lesson123',
      questions: [
        {
          question: 'What is 2 + 2?',
          options: ['3', '4', '5'],
          answer: '4'
        },
        {
          question: 'What is the capital of France?',
          options: ['Paris', 'Berlin', 'Madrid'],
          answer: 'Paris'
        }
      ]
    })
  };

  vi.spyOn(firestore, 'getDocs').mockResolvedValueOnce({ empty: false, docs: [mockQuizDoc] });
  const addDocSpy = vi.spyOn(firestore, 'addDoc').mockResolvedValueOnce({ id: 'result1' });

  renderWithRoute();

  await waitFor(() => {
    expect(screen.getByText(/Lesson Quiz/i)).toBeInTheDocument();
    expect(screen.getByText(/What is 2 \+ 2\?/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByLabelText('4'));
  fireEvent.click(screen.getByLabelText('Paris'));
  fireEvent.click(screen.getByText(/Submit Quiz/i));

  await waitFor(() => {
    expect(screen.getByText(/Quiz Submitted!/i)).toBeInTheDocument();
    expect(addDocSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      participantId: 'participant1',
      score: 2,
      answers: ['4', 'Paris']
    }));
  });
});
