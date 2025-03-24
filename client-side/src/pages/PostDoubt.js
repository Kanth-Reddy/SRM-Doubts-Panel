import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import './PostDoubt.css'; // Import the CSS file

const PostDoubt = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in to post a doubt.');
      return;
    }

    if (!title || !description) {
      alert('Please fill in all fields.');
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

      await addDoc(collection(db, 'doubts'), {
        title,
        description,
        fileURL,
        postedBy: user.email,
        createdAt: serverTimestamp(),
      });

      alert('Doubt posted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error posting doubt:', error);
      setError('An error occurred while posting your doubt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-doubt-container">
      <div className="post-doubt-box">
        <h1 className="post-doubt-title">Post Your Doubt</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="post-doubt-form">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input type="file" onChange={handleFileChange} />
          <button type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post Doubt'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostDoubt;