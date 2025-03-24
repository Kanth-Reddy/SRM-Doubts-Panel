import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUsernameFromEmail = (email) => {
    return email ? email.split('@')[0] : '';
  };

  // Fetch doubts for search with case-insensitivity
  useEffect(() => {
    const fetchDoubts = async () => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      try {
        const doubtsRef = collection(db, 'doubts');
        const querySnapshot = await getDocs(doubtsRef);

        const results = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((doubt) =>
            doubt.title.toLowerCase().includes(searchTerm.toLowerCase())
          );

        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch (error) {
        console.error('Error searching doubts:', error);
      }
    };

    const delayDebounceFn = setTimeout(fetchDoubts, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleResultClick = (doubtId) => {
    navigate(`/doubt/${doubtId}`);
    setShowDropdown(false);
    setSearchTerm('');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        {/* Logo */}
        <Link className="navbar-brand" to="/">
          SRM Doubts Panel
        </Link>

        {/* Navbar Content: Flexbox Layout */}
        <div className="d-flex align-items-center w-100">
          {/* Centered Search Bar */}
          <form
            className="d-flex mx-auto position-relative"
            style={{ width: '40%' }}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              className="form-control"
              type="search"
              placeholder="Search doubts..."
              aria-label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowDropdown(searchResults.length > 0)}
            />
            {showDropdown && (
              <div
                className="dropdown-menu show"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                }}
              >
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    className="dropdown-item"
                    onClick={() => handleResultClick(result.id)}
                  >
                    {result.title}
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Navigation Items on the Right */}
          <ul className="navbar-nav ms-auto d-flex align-items-center">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/my-doubts">
                My Doubts
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/solved-doubts">
                Solved Doubts
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/leaderboard">
                Leaderboard
              </Link>
            </li>

            {user && user.email && (
              <li className="nav-item">
                <span className="nav-link text-light">
                  {getUsernameFromEmail(user.email)}
                </span>
              </li>
            )}

            <li className="nav-item">
              <button className="btn btn-danger ms-2" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
