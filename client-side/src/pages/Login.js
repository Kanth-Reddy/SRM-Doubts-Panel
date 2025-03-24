import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Login.css';
import Carousel from 'react-bootstrap/Carousel';
import { auth } from '../firebase/firebaseConfig'; // Import auth from Firebase

const Login = () => {
  const { signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithGoogle();
      
      console.log('User Credential:', userCredential); // Debugging log
  
      if (!userCredential) {
        setError('Google sign-in failed.');
        return;
      }
  
      const user = userCredential.user || userCredential; // Ensure correct data extraction
  
      console.log('Signed-in User:', user); // Debugging log
  
      if (!user || !user.email) {
        throw new Error('User information is not available.');
      }
  
      if (user.email.endsWith('@srmist.edu.in')) {
        console.log('Redirecting to home page...'); // Debugging log
        navigate('/'); // Redirect after successful login
      } else {
        await auth.signOut();
        setError('Only @srmist.edu.in emails are allowed to login.');
      }
    } catch (error) {
      console.error('Sign-in Error:', error);
      setError(error.message);
    }
  };
  
  
  

  return (
    <div className="login-container">
      {/* Bootstrap Carousel as Background */}
      <Carousel controls={false} indicators={false} interval={3000} pause={false}>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="SRM-Entry.png"
            alt="First slide"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="SRM-UB.jpeg"
            alt="Second slide"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="SRM-TP.jpg"
            alt="Third slide"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="SRM-HOSPI.png"
            alt="Fourth slide"
          />
        </Carousel.Item>
      </Carousel>

      {/* Login Box */}
      <div className="login-box">
        <div className="login-left">
          <h1 className="login-title">Login to SRM Doubts Panel</h1>
          {error && <p className="error-message">{error}</p>}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          <p className="login-instructions">
            Please sign in only with your SRM email address (@srmist.edu.in).
          </p>
        </div>
        <div className="login-right">
          <h2 className="login-title">Welcome to SRM Doubts Panel</h2>
          <p className="login-instructions">
            SRM Institute of Science and Technology is a leading institution dedicated to excellence in education and research. The SRM Doubts Panel is a closed community app designed to help students collaborate and resolve academic queries efficiently.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;