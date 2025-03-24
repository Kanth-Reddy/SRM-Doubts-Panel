import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { FiPlusCircle, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext'; // Ensure you have authentication context
import styles from './Home.module.css';

const Home = () => {
  const [doubts, setDoubts] = useState([]);
  const { user } = useAuth(); // Get current logged-in user
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoubts = async () => {
      const doubtsQuery = query(collection(db, 'doubts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(doubtsQuery);
      const fetchedDoubts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      });
      setDoubts(fetchedDoubts);
    };

    fetchDoubts();
  }, []);

  const handleDoubtClick = (id) => {
    navigate(`/doubt/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/edit-doubt/${id}`); // Navigate to the edit page
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this doubt?")) {
      try {
        await deleteDoc(doc(db, 'doubts', id));
        setDoubts(doubts.filter(doubt => doubt.id !== id)); // Update state
      } catch (error) {
        console.error("Error deleting doubt:", error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Doubts Stack</h1>
      <div className={styles.doubtStack}>
        {doubts.map(doubt => (
          <div
            key={doubt.id}
            className={styles.doubtCard}
            onClick={() => handleDoubtClick(doubt.id)}
          >
            <p className={styles.doubtTitle}>{doubt.title}</p>
            <p className={styles.doubtDescription}>{doubt.description}</p>
            {doubt.fileURL && (
              <a
                href={doubt.fileURL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.fileLink}
                onClick={(e) => e.stopPropagation()}
              >
                View File
              </a>
            )}
            <p className={styles.postedBy}>Posted by: {doubt.postedBy}</p>
            <p className={styles.postedBy}>Date: {doubt.createdAt.toLocaleDateString()}</p>
            
            {/* Edit & Delete Buttons (Only for User Who Posted) */}
            {user && user.email === doubt.postedBy && (
              <div className={styles.actions}>
                <FiEdit className={styles.editIcon} onClick={(e) => { e.stopPropagation(); handleEdit(doubt.id); }} />
                <FiTrash2 className={styles.deleteIcon} onClick={(e) => { e.stopPropagation(); handleDelete(doubt.id); }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={styles.addButton}>
        <button onClick={() => navigate('/post-doubt')}>
          <FiPlusCircle className={styles.addButtonIcon} />
        </button>
      </div>
    </div>
  );
};

export default Home;