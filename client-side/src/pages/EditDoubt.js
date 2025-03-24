import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import styles from './EditDoubt.module.css';

const EditDoubt = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileURL, setFileURL] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoubt = async () => {
      try {
        const doubtDoc = await getDoc(doc(db, 'doubts', id));
        if (!doubtDoc.exists()) {
          setError('Doubt not found.');
          return;
        }

        const doubtData = doubtDoc.data();
        if (user?.email !== doubtData.postedBy) {
          setError('Unauthorized access.');
          return;
        }

        setTitle(doubtData.title);
        setDescription(doubtData.description);
        setFileURL(doubtData.fileURL || '');
      } catch (err) {
        console.error('Error fetching doubt:', err);
        setError('Failed to load doubt.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoubt();
  }, [id, user]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpdate = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Title and description cannot be empty.');
      return;
    }
  
    setLoading(true);
    try {
      let updatedFileURL = fileURL;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'SRM Doubts Panel');
        formData.append('cloud_name', 'dvqtfuzmp');
        
        const response = await axios.post('https://api.cloudinary.com/v1_1/dvqtfuzmp/upload', formData);
        updatedFileURL = response.data.secure_url;
      }
  
      await updateDoc(doc(db, 'doubts', id), {
        title,
        description,
        fileURL: updatedFileURL,
      });
  
      navigate('/'); // Navigate to home after updating
    } catch (err) {
      console.error('Error updating doubt:', err);
      setError('Failed to update doubt.');
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Doubt</h1>
      <input
        type="text"
        className={styles.input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter title"
      />
      <textarea
        className={styles.textarea}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter description"
      />
      {fileURL && (
        <a href={fileURL} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
          View Current File
        </a>
      )}
      <input type="file" className={styles.fileInput} onChange={handleFileChange} />
      <button className={styles.updateButton} onClick={handleUpdate} disabled={loading}>
        {loading ? 'Updating...' : 'Update Doubt'}
      </button>
    </div>
  );
};

export default EditDoubt;
