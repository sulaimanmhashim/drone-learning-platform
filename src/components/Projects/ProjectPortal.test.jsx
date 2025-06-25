import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectPortal from './ProjectPortal';
import * as firestore from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { vi } from 'vitest';

// ==========================
// Mocks
// ==========================

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');

  return {
    ...actual,
    collection: (_db, name) => ({
      __name: name,
      toString: () => name
    }),
    query: vi.fn((ref) => ref),
    where: vi.fn((...args) => args),
    doc: vi.fn(() => ({})),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    serverTimestamp: () => new Date()
  };
});

vi.mock('../../firebase/firebaseConfig', () => ({
  db: {},
  auth: {}
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

// ==========================
// Utils
// ==========================

function renderPortal() {
  render(
    <BrowserRouter>
      <ProjectPortal />
    </BrowserRouter>
  );
}

afterEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
});

// ==========================
// Tests
// ==========================

describe('ProjectPortal', () => {
  describe('as participant', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        currentUser: { uid: 'user123' },
        userRole: 'participant'
      });

      vi.spyOn(firestore, 'getDocs').mockImplementation((q) => {
        const name = q.toString();

        if (name === 'groups') {
          console.log("Mock getDocs: fetching groups");
          return Promise.resolve({
            docs: [{ id: 'group1', data: () => ({ members: ['user123'] }) }]
          });
        }

        if (name === 'projectProposals') {
          console.log("Mock getDocs: checking for existing proposals");
          return Promise.resolve({
            empty: true,
            docs: []
          });
        }

        if (name === 'users') {
          console.log("Mock getDocs: fetching coordinators");
          return Promise.resolve({
            docs: [{ id: 'coord1', data: () => ({ displayName: 'Dr. Smith' }) }]
          });
        }

        throw new Error(`Unexpected collection passed to getDocs: ${name}`);
      });
    });

    test('renders form if in group and no proposal', async () => {
      renderPortal();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /submit proposal/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/project title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/coordinator/i)).toBeInTheDocument();
      });
    });

    test('participant can submit a proposal when in a group and no proposal exists', async () => {
      const addDocSpy = vi.spyOn(firestore, 'addDoc').mockResolvedValue({ id: 'proposal123' });

      renderPortal();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /submit proposal/i })).toBeInTheDocument();
        console.log('Form rendered, ready to submit.');
      });

      fireEvent.change(screen.getByLabelText(/project title/i), {
        target: { value: 'Drone Navigator' }
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'A drone with autonomous flight capabilities' }
      });
      fireEvent.change(screen.getByLabelText(/coordinator/i), {
        target: { value: 'coord1' }
      });
      fireEvent.click(screen.getByRole('button', { name: /submit proposal/i }));

      await waitFor(() => {
        expect(addDocSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          title: 'Drone Navigator',
          description: 'A drone with autonomous flight capabilities',
          coordinatorId: 'coord1',
          participantId: 'user123',
          status: 'pending'
        }));
      });
    });

    test('hides form if proposal already exists', async () => {
      vi.spyOn(firestore, 'getDocs').mockImplementation((q) => {
        const name = q.toString();
        if (name === 'groups') {
          return Promise.resolve({
            docs: [{ id: 'group1', data: () => ({ members: ['user123'] }) }]
          });
        }
        if (name === 'projectProposals') {
          return Promise.resolve({
            empty: false,
            docs: [{
              id: 'existing1', data: () => ({
                title: 'Existing',
                description: 'Already submitted',
                coordinatorId: 'coord1',
                participantId: 'user123',
                status: 'pending'
              })
            }]
          });
        }
        if (name === 'users') {
          return Promise.resolve({ docs: [] });
        }
        throw new Error('Unexpected call');
      });

      renderPortal();
      expect(await screen.findByText(/Submitted Proposal/i)).toBeInTheDocument();
    });

    test('shows message if user is not in a group', async () => {
      vi.spyOn(firestore, 'getDocs').mockResolvedValueOnce({
        docs: [] // No group found
      });

      renderPortal();
      expect(await screen.findByText(/you must be in a group/i)).toBeInTheDocument();
    });

    test('participant can update project progress', async () => {
      const updateSpy = vi.spyOn(firestore, 'updateDoc').mockResolvedValue();

      // Mock group and proposal exists
      vi.spyOn(firestore, 'getDocs').mockImplementation((q) => {
        const name = q.toString();

        if (name === 'groups') {
          return Promise.resolve({
            docs: [{ id: 'group1', data: () => ({ members: ['user123'] }) }]
          });
        }

        if (name === 'projectProposals') {
          return Promise.resolve({
            empty: false,
            docs: [{
              id: 'proposal1',
              data: () => ({
                title: 'Test Project',
                description: 'Desc',
                coordinatorId: 'coord1',
                participantId: 'user123',
                status: 'in progress'
              })
            }]
          });
        }

        if (name === 'users') {
          return Promise.resolve({ docs: [] });
        }

        throw new Error(`Unexpected query: ${name}`);
      });

      renderPortal();

      // Wait for proposal to appear
      expect(await screen.findByText(/submitted proposal/i)).toBeInTheDocument();

      // Fill and submit progress
      const progressBox = screen.getByLabelText(/update progress/i);
      fireEvent.change(progressBox, { target: { value: 'Completed first phase' } });
      fireEvent.click(screen.getByText(/submit progress/i));

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          progress: 'Completed first phase'
        }));
      });
    });


  });

  describe('as coordinator', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        currentUser: { uid: 'coord123' },
        userRole: 'coordinator'
      });

      vi.spyOn(firestore, 'getDocs').mockImplementation((q) => {
        const name = q.toString();

        if (name === 'projectProposals') {
          return Promise.resolve({
            docs: [{
              id: 'p1',
              data: () => ({
                title: 'AI Drone',
                description: 'Tracks motion',
                groupId: 'g1',
                status: 'pending'
              })
            }]
          });
        }

        throw new Error(`Unexpected collection for coordinator test: ${name}`);
      });
    });

    test('shows assigned proposals', async () => {
      renderPortal();

      expect(await screen.findByText(/proposals assigned to you/i)).toBeInTheDocument();
      expect(screen.getByText(/AI Drone/i)).toBeInTheDocument();
    });

    test('updates proposal status', async () => {
      const updateSpy = vi.spyOn(firestore, 'updateDoc').mockResolvedValue();

      renderPortal();

      const select = await screen.findByLabelText(/update status/i);
      fireEvent.change(select, { target: { value: 'accepted' } });

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledWith(expect.anything(), { status: 'accepted' });
      });
    });
  });
});
