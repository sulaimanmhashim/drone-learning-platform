// Mock Firestore safely inside factory
vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');

    const mockGetDocs = vi.fn();
    globalThis.__mocks__ = { mockGetDocs }; // expose for use in tests

    return {
        ...actual,
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        getDocs: mockGetDocs,
        Timestamp: actual.Timestamp
    };
});

vi.mock('jspdf', () => {
    const saveMock = vi.fn();
    globalThis.__mocks__.saveMock = saveMock;

    return {
        default: class {
            text = vi.fn();
            autoTable = vi.fn();
            save = saveMock;
        }
    };
});

vi.mock('jspdf-autotable', () => ({}));

vi.mock('../../firebase/firebaseConfig', () => ({
    db: {}
}));

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        currentUser: { uid: 'coord1' },
        userRole: 'coordinator'
    })
}));

// Imports AFTER mocks
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoordinatorReport from './CoordinatorReport';
import { Timestamp } from 'firebase/firestore';

afterEach(() => {
    vi.clearAllMocks();
});

test('fetches and displays proposals for weekly report', async () => {
    globalThis.__mocks__.mockGetDocs.mockResolvedValueOnce({
        docs: [
            {
                id: '1',
                data: () => ({
                    title: 'Drone AI',
                    status: 'in progress',
                    groupId: 'g1',
                    progress: 'Testing sensors',
                    createdAt: Timestamp.fromDate(new Date())
                })
            }
        ]
    });

    render(<CoordinatorReport />);
    expect(await screen.findByText(/Download Report/i)).toBeInTheDocument();
    expect(await screen.findByText(/1 proposals included/i)).toBeInTheDocument();
});

test('switching to monthly triggers data reload', async () => {
    globalThis.__mocks__.mockGetDocs.mockResolvedValue({
        docs: []
    });

    render(<CoordinatorReport />);
    fireEvent.change(screen.getByLabelText(/Report Type/i), {
        target: { value: 'monthly' }
    });

    await waitFor(() => {
        expect(globalThis.__mocks__.mockGetDocs).toHaveBeenCalled();
    });
});

test('clicking PDF button generates and saves file', async () => {
    globalThis.__mocks__.mockGetDocs.mockResolvedValueOnce({
        docs: [
            {
                id: '1',
                data: () => ({
                    title: 'Drone AI',
                    status: 'in progress',
                    groupId: 'g1',
                    progress: 'Testing sensors',
                    createdAt: Timestamp.fromDate(new Date())
                })
            }
        ]
    });

    render(<CoordinatorReport />);
    const btn = await screen.findByText(/Download Report/i);
    fireEvent.click(btn);

    await waitFor(() => {
        expect(globalThis.__mocks__.saveMock).toHaveBeenCalled();
    });
});
