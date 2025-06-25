import { useAuth } from '../../contexts/AuthContext';
import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    deleteDoc,
    updateDoc,
    serverTimestamp,
    orderBy,
    query
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useEffect, useState } from 'react';

export default function LessonPortal() {
    const { currentUser, userRole } = useAuth();

    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);

    const [newTitle, setNewTitle] = useState('');
    const [newLevel, setNewLevel] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newResource, setNewResource] = useState('');

    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editLevel, setEditLevel] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editResource, setEditResource] = useState('');

    const lessonsRef = collection(db, 'lessons');

    useEffect(() => {
        const fetchLessons = async () => {
            const q = query(lessonsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLessons(data);
        };

        fetchLessons();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newTitle || !newLevel || !newContent) return;
        await addDoc(lessonsRef, {
            title: newTitle,
            level: newLevel,
            content: newContent,
            resource: newResource,
            coordinatorId: currentUser.uid,
            createdAt: serverTimestamp()
        });
        setNewTitle('');
        setNewLevel('');
        setNewContent('');
        setNewResource('');
        const snapshot = await getDocs(lessonsRef);
        setLessons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, 'lessons', id));
        setLessons(lessons.filter(l => l.id !== id));
        if (selectedLesson?.id === id) setSelectedLesson(null);
    };

    const handleSaveEdit = async () => {
        const ref = doc(db, 'lessons', editId);
        await updateDoc(ref, {
            title: editTitle,
            level: editLevel,
            content: editContent,
            resource: editResource
        });
        setEditId(null);
        const snapshot = await getDocs(lessonsRef);
        setLessons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>{userRole === 'coordinator' ? 'Lesson Manager' : 'Lessons'}</h2>

            {userRole === 'coordinator' && (
                <>
                    <form onSubmit={handleAdd} style={{ marginBottom: '2rem' }}>
                        <h3>Add New Lesson</h3>
                        <input
                            type="text"
                            placeholder="Title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <select
                            value={newLevel}
                            onChange={(e) => setNewLevel(e.target.value)}
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                        >
                            <option value="">Select Level</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                        <textarea
                            placeholder="Lesson Content"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            rows={4}
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <input
                            type="text"
                            placeholder="External Resource URL"
                            value={newResource}
                            onChange={(e) => setNewResource(e.target.value)}
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <button type="submit">Add Lesson</button>
                    </form>
                </>
            )}

            <h3>{userRole === 'coordinator' ? 'All Lessons' : 'Available Lessons'}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {lessons.map((lesson) => (
                    <li key={lesson.id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
                        {editId === lesson.id ? (
                            <>
                                <input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    style={{ width: '100%', marginBottom: '0.5rem' }}
                                />
                                <select
                                    value={editLevel}
                                    onChange={(e) => setEditLevel(e.target.value)}
                                    style={{ width: '100%', marginBottom: '0.5rem' }}
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    rows={4}
                                    style={{ width: '100%', marginBottom: '0.5rem' }}
                                />
                                <input
                                    value={editResource}
                                    onChange={(e) => setEditResource(e.target.value)}
                                    style={{ width: '100%', marginBottom: '0.5rem' }}
                                />
                                <button onClick={handleSaveEdit}>Save</button>
                                <button onClick={() => setEditId(null)} style={{ marginLeft: '0.5rem' }}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <h4 onClick={() => setSelectedLesson(lesson)} style={{ cursor: 'pointer' }}>{lesson.title}</h4>
                                <p><strong>Level:</strong> {lesson.level}</p>
                                {userRole === 'coordinator' && (
                                    <>
                                        <button onClick={() => {
                                            setEditId(lesson.id);
                                            setEditTitle(lesson.title);
                                            setEditLevel(lesson.level);
                                            setEditContent(lesson.content);
                                            setEditResource(lesson.resource);
                                        }}>Edit</button>
                                        <button onClick={() => handleDelete(lesson.id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
                                    </>
                                )}
                            </>
                        )}
                    </li>
                ))}
            </ul>

            {selectedLesson && userRole === 'participant' && (
                <div style={{ marginTop: '2rem', padding: '1rem', borderTop: '2px solid #000' }}>
                    <h3>{selectedLesson.title}</h3>
                    <p><strong>Level:</strong> {selectedLesson.level}</p>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{selectedLesson.content}</div>
                    {selectedLesson.resource && (
                        <p style={{ marginTop: '1rem' }}>
                            <a href={selectedLesson.resource} target="_blank" rel="noopener noreferrer">
                                External Resource
                            </a>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
