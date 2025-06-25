import { useAuth } from '../../contexts/AuthContext';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function QuizForm() {
  const { currentUser } = useAuth();
  const { lessonId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      const q = query(collection(db, 'quizzes'), where('lessonId', '==', lessonId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const quizData = snapshot.docs[0].data();
        setQuiz({ id: snapshot.docs[0].id, ...quizData });
        setAnswers(new Array(quizData.questions.length).fill(''));
      }
    };
    fetchQuiz();
  }, [lessonId]);

  const handleSelect = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let scoreCount = 0;

    quiz.questions.forEach((q, i) => {
      if (q.answer.trim().toLowerCase() === answers[i]?.trim().toLowerCase()) {
        scoreCount++;
      }
    });

    setScore(scoreCount);
    setSubmitted(true);

    await addDoc(collection(db, 'quizResults'), {
      participantId: currentUser.uid,
      lessonId,
      quizId: quiz.id,
      answers,
      score: scoreCount,
      submittedAt: serverTimestamp()
    });
  };

  if (!quiz) return <p style={{ padding: '2rem' }}>Loading quiz...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Lesson Quiz</h2>

      {submitted ? (
        <div>
          <p><strong>Quiz Submitted!</strong></p>
          <p>Your score: {score} / {quiz.questions.length}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {quiz.questions.map((q, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <p><strong>{i + 1}. {q.question}</strong></p>
              {q.options.map((opt, j) => (
                <div key={j}>
                  <label>
                    <input
                      type="radio"
                      name={`q${i}`}
                      value={opt}
                      checked={answers[i] === opt}
                      onChange={() => handleSelect(i, opt)}
                    />{' '}
                    {opt}
                  </label>
                </div>
              ))}
            </div>
          ))}

          <button type="submit">Submit Quiz</button>
        </form>
      )}
    </div>
  );
}
