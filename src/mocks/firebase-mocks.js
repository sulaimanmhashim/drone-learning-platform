// ----------- AUTH ----------------
vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    getAuth: vi.fn(() => ({})),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    GoogleAuthProvider: vi.fn()
  };
});


// ----------- FIRESTORE ----------------
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');

  return {
    ...actual,

    getFirestore: vi.fn(() => ({})),

    // Builders
    collection: vi.fn(() => ({})),
    doc: vi.fn(() => ({})),
    query: vi.fn((ref, ...constraints) => ({ ref, constraints })),
    where: vi.fn((field, op, value) => ({ field, op, value })),
    orderBy: vi.fn((field, direction) => ({ field, direction })),

    // Core Firestore Ops
    getDoc: vi.fn(() =>
      Promise.resolve({
        exists: () => true,
        data: () => ({
          role: 'participant',
          displayName: 'Mock User',
          email: 'mock@example.com'
        })
      })
    ),

    setDoc: vi.fn(() => Promise.resolve()),
    addDoc: vi.fn(() => Promise.resolve({ id: 'mockDocId' })),
    updateDoc: vi.fn(() => Promise.resolve()),

    // Mock Firestore queries for test views
    getDocs: vi.fn(() =>
      Promise.resolve({
        empty: false,
        docs: [
          {
            id: 'lesson1',
            data: () => ({
              title: 'Intro to Drones',
              level: 'Beginner',
              coordinatorId: 'coord1',
              content: 'Lesson content here',
              resources: ['https://example.com/resource'],
              createdAt: {
                toDate: () => new Date('2024-04-01')
              }
            })
          },
          {
            id: 'result1',
            data: () => ({
              lessonTitle: 'Drone Law',
              score: 85,
              submittedAt: {
                toDate: () => new Date('2024-04-02')
              }
            })
          },
          {
            id: 'quiz1',
            data: () => ({
              title: 'Drone Quiz',
              lessonId: 'lesson1',
              questions: [
                {
                  question: 'What is the flight limit?',
                  options: ['100m', '200m'],
                  answer: '100m'
                },
                {
                  question: 'Can you fly over people?',
                  options: ['Yes', 'No'],
                  answer: 'No'
                }
              ],
              createdAt: {
                toDate: () => new Date('2024-04-03')
              }
            })
          },
          {
            id: 'group1',
            data: () => ({
              name: 'Group Alpha',
              leaderId: 'uid123',
              members: ['uid123', 'uid456'],
              createdAt: {
                toDate: () => new Date('2024-04-04')
              }
            })
          },
          {
            id: 'project1',
            data: () => ({
              title: 'Drone Delivery',
              description: 'Autonomous drone project',
              participantId: 'uid789',
              groupId: 'group1',
              coordinatorId: 'coord1',
              status: 'pending',
              createdAt: {
                toDate: () => new Date('2024-04-05')
              }
            })
          }
        ]
      })
    )
  };
});


// ----------- ANALYTICS ----------------
vi.mock('firebase/analytics', async () => {
  const actual = await vi.importActual('firebase/analytics');
  return {
    ...actual,
    getAnalytics: vi.fn(() => ({}))
  };
});


// ----------- FIREBASE APP ----------------
vi.mock('firebase/app', async () => {
  const actual = await vi.importActual('firebase/app');
  return {
    ...actual,
    initializeApp: vi.fn(() => ({}))
  };
});
