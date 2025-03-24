import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, query, orderBy, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import axios from 'axios'; // For uploading files to Cloudinary
import styles from './DoubtDetail.module.css'; 
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import icons

const DoubtDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [doubt, setDoubt] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editedReplyText, setEditedReplyText] = useState('');

  useEffect(() => {
    const fetchDoubtAndReplies = async () => {
      if (!user) {
        setError('You must be logged in to view this doubt.');
        setLoading(false);
        return;
      }

      try {
        // Fetch doubt
        const doubtDoc = await getDoc(doc(db, 'doubts', id));
        if (!doubtDoc.exists()) {
          setError('Doubt not found.');
          return;
        }
        setDoubt({ id: doubtDoc.id, ...doubtDoc.data() });

        // Fetch replies sorted by timestamp
        const q = query(collection(db, 'doubts', id, 'replies'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedReplies = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));
        setReplies(fetchedReplies);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load doubt or replies.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoubtAndReplies();
  }, [id, user]);

  const handleReplySubmit = async () => {
    if (!newReply.trim()) {
      setError('Reply cannot be empty.');
      return;
    }

    if (!user) {
      setError('You must be logged in to post a reply.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let fileURL = '';
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'SRM Doubts Panel'); 
        formData.append('cloud_name', 'dvqtfuzmp'); 

        const response = await axios.post('https://api.cloudinary.com/v1_1/dvqtfuzmp/upload', formData);
        fileURL = response.data.secure_url; 
      }

      // Add reply to Firestore
      const replyRef = await addDoc(collection(db, 'doubts', id, 'replies'), {
        text: newReply,
        user: user.email || 'Anonymous',
        fileURL,
        timestamp: new Date(),
      });

      setReplies((prevReplies) => [
        { id: replyRef.id, text: newReply, user: user.email, fileURL, timestamp: new Date() },
        ...prevReplies,
      ]);

      setNewReply('');
      setFile(null);
    } catch (error) {
      console.error('Error posting reply:', error);
      setError('Failed to post reply.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditReply = async (replyId) => {
    if (!editedReplyText.trim()) {
      setError('Reply cannot be empty.');
      return;
    }

    try {
      const replyRef = doc(db, 'doubts', id, 'replies', replyId);
      await updateDoc(replyRef, { text: editedReplyText });

      setReplies((prevReplies) =>
        prevReplies.map((reply) =>
          reply.id === replyId ? { ...reply, text: editedReplyText } : reply
        )
      );

      setEditingReplyId(null);
      setEditedReplyText('');
    } catch (error) {
      console.error('Error editing reply:', error);
      setError('Failed to edit reply.');
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await deleteDoc(doc(db, 'doubts', id, 'replies', replyId));
      setReplies((prevReplies) => prevReplies.filter((reply) => reply.id !== replyId));
    } catch (error) {
      console.error('Error deleting reply:', error);
      setError('Failed to delete reply.');
    }
  };

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      {/* Question Section */}
      <div className={styles.questionSection}>
        <h1 className={styles.questionTitle}>{doubt?.title}</h1>
        <p className={styles.questionDescription}>{doubt?.description}</p>
        {doubt?.fileURL && (
          <a href={doubt.fileURL} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
            View Question File
          </a>
        )}
      </div>

      {/* Replies Section */}
      <div className={styles.repliesSection}>
        <h2 className={styles.repliesTitle}>Replies:</h2>
        {replies.map((reply) => (
          <div key={reply.id} className={styles.replyCard}>
            {editingReplyId === reply.id ? (
              <textarea
                value={editedReplyText}
                onChange={(e) => setEditedReplyText(e.target.value)}
                className={styles.textarea}
              />
            ) : (
              <p className={styles.replyText}>{reply.text}</p>
            )}
            
            {reply.fileURL && (
              <a href={reply.fileURL} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                View Reply File
              </a>
            )}

            <div className={styles.replyFooter}>
              <p className={styles.replyUser}>By: {reply.user}</p>
              <p className={styles.replyUser}>{reply.timestamp.toLocaleDateString()}</p>
              {user?.email === reply.user && (
                <div className={styles.replyActions}>
                  {editingReplyId === reply.id ? (
                    <button onClick={() => handleEditReply(reply.id)} className={styles.editButton}>Save</button>
                  ) : (
                    <FaEdit className={styles.editIcon} onClick={() => { setEditingReplyId(reply.id); setEditedReplyText(reply.text); }} />
                  )}
                  <FaTrash className={styles.deleteIcon} onClick={() => handleDeleteReply(reply.id)} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Reply Section */}
      <div className={styles.addReplySection}>
        <h2>Add a Reply</h2>
        <textarea
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          className={styles.textarea}
          placeholder="Write your reply..."
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className={styles.fileInput}
        />
        <button onClick={handleReplySubmit} className={styles.submitButton}>
          Submit Reply
        </button>
      </div>
    </div>
  );
};

export default DoubtDetail;