import { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

export default function QuizResultViewer() {
  const { currentUser } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const q = query(
        collection(db, 'quizResults'),
        where('participantId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);

      const enrichedResults = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const quizDoc = await getDoc(doc(db, 'quizzes', data.quizId));
          const quizData = quizDoc.exists() ? quizDoc.data() : null;

          return {
            id: docSnap.id,
            ...data,
            questions: quizData?.questions || []
          };
        })
      );

      setResults(enrichedResults);
      setLoading(false);
    };

    fetchResults();
  }, [currentUser.uid]);

  if (loading) return <p style={{ padding: '2rem' }}>Loading your quiz results...</p>;
  if (results.length === 0) return <p style={{ padding: '2rem' }}>You haven't submitted any quizzes yet.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Quiz Results</h2>
      {results.map((res, index) => (
        <div key={res.id} style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
          <p><strong>Lesson ID:</strong> {res.lessonId}</p>
          <p><strong>Score:</strong> {res.score} / {res.questions.length}</p>
          <p><strong>Submitted At:</strong> {res.submittedAt?.toDate().toLocaleString()}</p>

          <div style={{ marginTop: '1rem' }}>
            {res.questions.map((q, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <strong>{i + 1}. {q.question}</strong><br />
                <span>Your Answer: {res.answers[i]}</span><br />
                <span>Correct Answer: {q.answer}</span><br />
                <span style={{ color: res.answers[i] === q.answer ? 'green' : 'red' }}>
                  {res.answers[i] === q.answer ? 'Correct' : 'Incorrect'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
