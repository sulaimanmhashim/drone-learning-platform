import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import CoordinatorRoute from '../routes/CoordinatorRoute';
import ParticipantRoute from '../routes/ParticipantRoute';
import ProtectedRoute from '../routes/ProtectedRoute';


function renderRoute({ route, user, role }) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthContext.Provider
        value={{
          currentUser: user,
          userRole: role,
          loading: false
        }}
      >
        <Routes>
          <Route path="/" element={<p>Landing</p>} />
          <Route path="/coordinator" element={
            <CoordinatorRoute><p>Coordinator Page</p></CoordinatorRoute>
          } />
          <Route path="/participant" element={
            <ParticipantRoute><p>Participant Page</p></ParticipantRoute>
          } />
          <Route path="/protected" element={
            <ProtectedRoute><p>Protected Page</p></ProtectedRoute>
          } />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

test('grants access to coordinator route if user is coordinator', () => {
  renderRoute({ route: '/coordinator', user: { uid: 'admin' }, role: 'coordinator' });
  expect(screen.getByText(/Coordinator Page/i)).toBeInTheDocument();
});

test('blocks coordinator route if user is participant', () => {
  renderRoute({ route: '/coordinator', user: { uid: 'user123' }, role: 'participant' });
  expect(screen.getByText(/Landing/i)).toBeInTheDocument();
});
