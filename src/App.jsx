import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Global UI Components
import Navbar from './components/UI/Navbar';

// Core Pages
import LandingPage from './components/LandingPage';
import Participant from './components/Dashboard/Participant';
import Coordinator from './components/Dashboard/Coordinator';

// Lesson Module
import LessonPortal from './components/Lessons/LessonPortal';

// Group & Projects
import GroupPortal from './components/Groups/GroupPortal';
import ProjectPortal from './components/Projects/ProjectPortal';

// Quizzes
import QuizForm from './components/Quiz/QuizForm';
import QuizManager from './components/Quiz/QuizManager';
import QuizResultViewer from './components/Quiz/QuizResultViewer';

// Route Guards
import ParticipantRoute from './routes/ParticipantRoute';
import CoordinatorRoute from './routes/CoordinatorRoute';
import ProtectedRoute from './routes/ProtectedRoute';

// Global CSS Themes
import './styles/styles.css';

// Profile
import ViewProfile from './components/ViewProfile';

// Reports
import CoordinatorReport from './components/Reports/CoordinatorReport';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="fullscreen-layout">
          <Navbar />
          <Routes>

            {/* Public login page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LandingPage />} />

            {/* Participant Dashboard */}
            <Route
              path="/participant"
              element={
                <ParticipantRoute>
                  <Participant />
                </ParticipantRoute>
              }
            />

            {/* Coordinator Dashboard */}
            <Route
              path="/coordinator"
              element={
                <CoordinatorRoute>
                  <Coordinator />
                </CoordinatorRoute>
              }
            />

            {/* Shared Lessons Portal */}
            <Route
              path="/lessons"
              element={
                <ProtectedRoute>
                  <LessonPortal />
                </ProtectedRoute>
              }
            />

            {/* Participant Group Management */}
            <Route
              path="/participant/groups"
              element={
                <ParticipantRoute>
                  <GroupPortal />
                </ParticipantRoute>
              }
            />

            {/* Project Proposal Submission & Review */}
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectPortal />
                </ProtectedRoute>
              }
            />

            {/* Participant: Take Quiz */}
            <Route
              path="/quiz/:lessonId"
              element={
                <ParticipantRoute>
                  <QuizForm />
                </ParticipantRoute>
              }
            />

            {/* Participant: View Quiz Results */}
            <Route
              path="/quiz/results"
              element={
                <ParticipantRoute>
                  <QuizResultViewer />
                </ParticipantRoute>
              }
            />

            {/* Coordinator: Create Quizzes */}
            <Route
              path="/coordinator/quiz"
              element={
                <CoordinatorRoute>
                  <QuizManager />
                </CoordinatorRoute>
              }
            />

            <Route
              path="/coordinator/report"
              element={
                <CoordinatorRoute>
                  <CoordinatorReport />
                </CoordinatorRoute>
              }
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ViewProfile />
                </ProtectedRoute>
              }
            />

          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
