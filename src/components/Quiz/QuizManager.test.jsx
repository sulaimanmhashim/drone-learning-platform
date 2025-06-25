

// Mock Firestore
const mockGetDocs = vi.fn();
const mockAddDoc = vi.fn();

// ===== FIREBASE MOCKS =====
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');

  const mockGetDocs = vi.fn();
  const mockAddDoc = vi.fn();

  // Expose mocks globally so they can be used in tests
  globalThis.__mockGetDocs = mockGetDocs;
  globalThis.__mockAddDoc = mockAddDoc;

  return {
    ...actual,
    collection: vi.fn(() => ({})),
    getDocs: mockGetDocs,
    addDoc: mockAddDoc,
    serverTimestamp: () => new Date()
  };
});

// ===== FIREBASE CONFIG MOCK =====
vi.mock('../../firebase/firebaseConfig', () => ({
  db: {}, // prevents getFirestore(app) error
  auth: {}
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuizManager from './QuizManager';
import { BrowserRouter } from 'react-router-dom';

beforeEach(() => {
  globalThis.__mockGetDocs.mockResolvedValueOnce({
    docs: [
      {
        id: 'lesson1',
        data: () => ({ title: 'Drone Basics' })
      }
    ]
  });
});

afterEach(() => {
  vi.resetAllMocks();
});

test('loads lessons and renders select dropdown', async () => {
  render(<QuizManager />);

  await waitFor(() => {
    expect(screen.getByText(/Select Lesson/i)).toBeInTheDocument();
    expect(screen.getByText(/Drone Basics/i)).toBeInTheDocument();
  });
});

test('adds a question and displays preview', async () => {
  render(<QuizManager />);

  await waitFor(() => {
    expect(screen.getByText(/Drone Basics/i)).toBeInTheDocument();
  });

  fireEvent.change(screen.getByLabelText(/Select Lesson/i), {
    target: { value: 'lesson1' }
  });

  fireEvent.change(screen.getByPlaceholderText('Question'), {
    target: { value: 'What is the safe altitude for drones?' }
  });

  fireEvent.change(screen.getByPlaceholderText('Option 1'), {
    target: { value: '100 ft' }
  });
  fireEvent.change(screen.getByPlaceholderText('Option 2'), {
    target: { value: '200 ft' }
  });
  fireEvent.change(screen.getByPlaceholderText('Option 3'), {
    target: { value: '300 ft' }
  });
  fireEvent.change(screen.getByPlaceholderText('Option 4'), {
    target: { value: '400 ft' }
  });

  fireEvent.change(screen.getByDisplayValue('-- Select correct answer --'), {
    target: { value: '400 ft' }
  });

  fireEvent.click(screen.getByRole('button', { name: /Add Question/i }));

  expect(screen.getByText(/Questions Preview/i)).toBeInTheDocument();
  expect(screen.getByText(/What is the safe altitude for drones\?/i)).toBeInTheDocument();
  expect(screen.getByText(/400 ft ✅/i)).toBeInTheDocument();
});

test('submits quiz to Firestore', async () => {
  render(<QuizManager />);

  await waitFor(() => {
    expect(screen.getByText(/Drone Basics/i)).toBeInTheDocument();
  });

  fireEvent.change(screen.getByLabelText(/Select Lesson/i), {
    target: { value: 'lesson1' }
  });

  fireEvent.change(screen.getByPlaceholderText('Question'), {
    target: { value: 'What is the max range of a drone?' }
  });

  ['100m', '200m', '500m', '1km'].forEach((val, i) => {
    fireEvent.change(screen.getByPlaceholderText(`Option ${i + 1}`), {
      target: { value: val }
    });
  });

  fireEvent.change(screen.getByDisplayValue('-- Select correct answer --'), {
    target: { value: '1km' }
  });

  fireEvent.click(screen.getByRole('button', { name: /Add Question/i }));
  fireEvent.click(screen.getByText(/Submit Quiz/i));

  await waitFor(() => {
    expect(globalThis.__mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        lessonId: 'lesson1',
        questions: expect.any(Array),
        createdAt: expect.any(Date)
      })
    );
  });
});
