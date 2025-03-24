import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './MyDoubts.css'; // Import the CSS file

const MyDoubts = () => {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch doubts posted by the current user
  useEffect(() => {
    const fetchDoubts = async () => {
      if (!user) return;

      try {
        const doubtsRef = collection(db, 'doubts');
        const q = query(doubtsRef, where('postedBy', '==', user.email));
        const querySnapshot = await getDocs(q);

        const doubtsList = [];
        querySnapshot.forEach((doc) => {
          doubtsList.push({ id: doc.id, ...doc.data() });
        });

        setDoubts(doubtsList);
      } catch (error) {
        console.error('Error fetching doubts:', error);
        setError('Failed to fetch doubts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoubts();
  }, [user]);

  // Navigate to the doubt detail page
  const handleDoubtClick = (doubtId) => {
    navigate(`/doubt/${doubtId}`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="my-doubts-container">
      <h1 className="my-doubts-title">My Doubts</h1>
      {doubts.length === 0 ? (
        <p className="no-doubts">You haven't posted any doubts yet.</p>
      ) : (
        <ul className="doubts-list">
          {doubts.map((doubt) => (
            <li
              key={doubt.id}
              className="doubt-item"
              onClick={() => handleDoubtClick(doubt.id)}
            >
              <h3 className="doubt-title">{doubt.title}</h3>
              <p className="doubt-description">{doubt.description}</p>
              {doubt.fileURL && (
                <a
                  href={doubt.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="doubt-file"
                >
                  View Attachment
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyDoubts;