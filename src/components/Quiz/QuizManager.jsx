import { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export default function QuizManager() {
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    answer: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      const snapshot = await getDocs(collection(db, 'lessons'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLessons(data);
    };
    fetchLessons();
  }, []);

  const handleOptionChange = (index, value) => {
    const updated = [...currentQuestion.options];
    updated[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: updated });
  };

  const addQuestion = () => {
    if (
      !currentQuestion.question ||
      currentQuestion.options.some(opt => !opt) ||
      !currentQuestion.answer
    ) {
      alert('Please complete all fields for the question.');
      return;
    }

    setQuestions([...questions, { ...currentQuestion, type: 'mcq' }]);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      answer: ''
    });
  };

  const submitQuiz = async () => {
    if (!selectedLessonId || questions.length === 0) {
      alert('Select a lesson and add at least one question.');
      return;
    }

    await addDoc(collection(db, 'quizzes'), {
      lessonId: selectedLessonId,
      questions,
      createdAt: serverTimestamp()
    });

    setQuestions([]);
    setSelectedLessonId('');
    setSubmitted(true);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Quiz Manager</h2>

      {submitted && (
        <p style={{ color: 'green' }}>Quiz successfully created.</p>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="lessonSelect">
          <strong>Select Lesson:</strong>
        </label>
        <br />
        <select
          id="lessonSelect"
          value={selectedLessonId}
          onChange={(e) => setSelectedLessonId(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="">-- Select a lesson --</option>
          {lessons.map(lesson => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Add Question</h3>
        <input
          type="text"
          placeholder="Question"
          value={currentQuestion.question}
          onChange={(e) =>
            setCurrentQuestion({ ...currentQuestion, question: e.target.value })
          }
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />

        {currentQuestion.options.map((opt, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={opt}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
        ))}

        <select
          value={currentQuestion.answer}
          onChange={(e) =>
            setCurrentQuestion({ ...currentQuestion, answer: e.target.value })
          }
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          <option value="">-- Select correct answer --</option>
          {currentQuestion.options.map((opt, idx) =>
            opt ? <option key={idx} value={opt}>{opt}</option> : null
          )}
        </select>

        <button
          onClick={addQuestion}
          type="button"
          name="add-question"
        >
          Add Question</button>
      </div>

      <h3>Questions Preview</h3>
      <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
        {questions.map((q, i) => (
          <li key={i} style={{ marginBottom: '1rem' }}>
            <strong>{i + 1}. {q.question}</strong><br />
            {q.options.map((opt, j) => (
              <div key={j}>• {opt}{opt === q.answer ? ' ✅' : ''}</div>
            ))}
          </li>
        ))}
      </ul>

      <button onClick={submitQuiz}>Submit Quiz</button>
    </div>
  );
}
