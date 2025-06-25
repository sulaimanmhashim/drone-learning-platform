# Drone Learning Platform

A web-based educational platform enabling participants to learn drone technology through structured lessons, interactive quizzes, group collaboration, and project-based work. The system is designed with two user roles: **Participants** and **Coordinators**, with tailored access and functionality.

---

## 🚀 Features

### ✅ Functional Requirements (FR)

| Requirement ID | Description                                                                 | Status     |
|----------------|-----------------------------------------------------------------------------|------------|
| FR-01          | Register new users as participants or coordinators                         | ✔️ Completed |
| FR-02          | Login via Google authentication                                             | ✔️ Completed |
| FR-03          | Password reset via Google account                                           | ✔️ Completed (via external Google reset) |
| FR-04          | View and update user profile                                                | ✔️ Completed |
| FR-05          | Coordinator uploads lessons                                                 | ✔️ Completed |
| FR-06          | Coordinator creates quizzes for each lesson                                 | ✔️ Completed |
| FR-07          | Participants can form groups without restriction                            | ✔️ Completed |
| FR-08          | Participants can propose a project                                          | ✔️ Completed |
| FR-09          | Coordinators can accept or reject project proposals                         | ✔️ Completed |
| FR-10          | Participants view lessons                                                   | ✔️ Completed |
| FR-11          | Participants partake in quizzes                                             | ✔️ Completed |
| FR-12          | Quiz system calculates participant scores                                   | ✔️ Completed |
| FR-13          | Determines level advancement based on quiz scores                          | ✔️ Completed |
| FR-14          | Group can participate in project work                                       | ✔️ Completed |
| FR-15          | Participants can update project progress                                    | ✔️ Completed |
| FR-16          | Coordinators can generate weekly/monthly reports in PDF                    | ✔️ Completed |

---

## 🧪 Testing

All requirements are covered through testable components and corresponding unit/integration tests using **Vitest** and **React Testing Library**.

### Covered Test Files
- `Coordinator.test.jsx`
- `Participant.test.jsx`
- `GroupPortal.test.jsx`
- `LessonPortal.test.jsx`
- `ProjectPortal.test.jsx`
- `QuizForm.test.jsx`
- `QuizManager.test.jsx`
- `QuizResultViewer.test.jsx`
- `Navbar.test.jsx`
- `LandingPage.test.jsx`
- `CoordinatorRoute.test.jsx`
- `ParticipantsRoute.test.jsx`
- `ProtectedRoute.test.jsx`
- `ViewProfile.test.jsx`
- `CoordinatorReport.test.jsx`

Each test validates the UI, logic, and interactions for the associated feature and reflects the diagrams and workflows specified in the system design.

---

## 📁 Technologies Used

- **Frontend:** React + Vite for efficient component rendering and fast reloads
- **Backend (BaaS):** Firebase (Authentication, Firestore, Hosting)
- **Testing:** Vitest, React Testing Library
- **PDF Generation:** jsPDF with jsPDF-AutoTable
- **Date Handling:** date-fns
- **Routing:** React Router DOM

---

## ⚙️ Project Structure

src/
├── components/
│ ├── Dashboard/
│ ├── Lessons/
│ ├── Groups/
│ ├── Projects/
│ ├── Quiz/
│ ├── Reports/
│ └── UI/
├── contexts/ # Auth context
├── firebase/ # Firebase config
├── routes/ # Protected and role-based routes
├── styles/ # Global CSS
└── App.jsx


---

## 🧩 Design & Implementation

The platform follows modular design principles and separates logic by user roles. The navigation and user interface are responsive and intuitive for both desktop and mobile. Each module corresponds directly to a system feature or use case, aligned with diagrams provided in the system specification.

Special attention is given to:
- Clean separation of routes and authentication layers
- Reusable UI components
- Firebase mock abstraction in tests
- Error handling and edge cases in forms and submission flows

---

## 🔐 Non-Functional Requirements (NFR)

| NFR ID     | Requirement                                                                                      | Status     |
|------------|--------------------------------------------------------------------------------------------------|------------|
| NFR-01     | Securely protect user data using encryption (Firebase Authentication + Firestore Rules)         | ✔️ Completed |
| NFR-02     | Handle up to 1000 concurrent users with minimal latency (Firebase handles scaling)               | ✔️ Completed |
| NFR-03     | Intuitive and responsive UI across mobile and desktop                                            | ✔️ Completed |
| NFR-04     | Modular, maintainable codebase with separation of concern                                        | ✔️ Completed |
| NFR-05     | Comprehensive testing across all modules                                                         | ✔️ Completed |

---

## 📊 Reporting

- Coordinators can view project progress by participants.
- Report view can be toggled between **weekly** and **monthly**.
- Reports can be downloaded as PDF files with detailed project data (title, group, progress, submission date).

---

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run all test suites
npm run test

```

---

## 📄 License

This project is developed for educational purposes and is part of a final year academic submission. Not for commercial redistribution without prior consent.

