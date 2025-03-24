import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import styles from './SolvedDoubts.module.css';
import { useNavigate } from 'react-router-dom';

const SolvedDoubts = () => {
  const { user } = useAuth(); // Get the logged-in user
  const [solvedDoubts, setSolvedDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchSolvedDoubts = async () => {
      if (!user) {
        console.log("No user found. Cannot fetch solved doubts.");
        return;
      }

      try {
        console.log("Fetching solved doubts for:", user.email);
        const doubtsQuery = query(collection(db, 'doubts'));
        const doubtsSnapshot = await getDocs(doubtsQuery);
        let solved = [];

        for (const doubtDoc of doubtsSnapshot.docs) {
          console.log("Checking doubt:", doubtDoc.id, doubtDoc.data());
          const repliesQuery = query(collection(db, 'doubts', doubtDoc.id, 'replies'));
          const repliesSnapshot = await getDocs(repliesQuery);

          const userReplies = repliesSnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() })) // Include reply ID
            .filter((reply) => {
              console.log("Reply found:", reply);
              return reply.user === user.email; // Ensure this matches the Firestore field
            });

          if (userReplies.length > 0) {
            solved.push({
              id: doubtDoc.id,
              ...doubtDoc.data(),
              replies: userReplies,
            });
          }
        }

        console.log("Solved doubts:", solved);
        setSolvedDoubts(solved);
      } catch (err) {
        console.error('Error fetching solved doubts:', err);
        setError('Failed to load solved doubts.');
      } finally {
        setLoading(false);
      }
    };

    fetchSolvedDoubts();
  }, [user]);

  // Function to handle doubt card click
  const handleDoubtClick = (doubtId) => {
    navigate(`/doubt/${doubtId}`); // Navigate to the doubt detail page
  };

  if (!user) return <p className={styles.error}>Please log in to view solved doubts.</p>;
  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Solved Doubts</h1>

      {solvedDoubts.length === 0 ? (
        <p className={styles.noSolved}>No solved doubts yet.</p>
      ) : (
        solvedDoubts.map((doubt) => (
          <div
            key={doubt.id}
            className={styles.doubtCard}
            onClick={() => handleDoubtClick(doubt.id)} // Make the card clickable
            style={{ cursor: 'pointer' }} // Add pointer cursor for better UX
          >
            <h2>{doubt.title}</h2>
            <p>{doubt.description}</p>
            {doubt.fileURL && (
              <a
                href={doubt.fileURL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.fileLink}
              >
                View Doubt File
              </a>
            )}
            <h3>Replies:</h3>
            {doubt.replies.map((reply, index) => (
              <div key={reply.id || index} className={styles.replyCard}>
                <p>
                  <strong>{reply.user}:</strong> {reply.text}
                </p>
                {reply.fileURL && (
                  <a
                    href={reply.fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.fileLink}
                  >
                    View Reply File
                  </a>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default SolvedDoubts;