import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import Home from './pages/Home';
import DoubtDetail from './pages/DoubtDetail';
import Login from './pages/Login';
import PostDoubt from './pages/PostDoubt';
import MyDoubts from './pages/MyDoubts';
import EditDoubt from './pages/EditDoubt'; // Import the EditDoubt component
import Layout from './components/Layout'; // Import the Layout component
import SolvedDoubts from './pages/SolvedDoubts'; // Import the SolvedDoubts component

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Home */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Doubt Detail */}
          <Route
            path="/doubt/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <DoubtDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Post Doubt */}
          <Route
            path="/post-doubt"
            element={
              <ProtectedRoute>
                <Layout>
                  <PostDoubt />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* My Doubts */}
          <Route
            path="/my-doubts"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyDoubts />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Solved Doubts */}
          <Route
            path="/solved-doubts"
            element={
              <ProtectedRoute>
                <Layout>
                  <SolvedDoubts />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Edit Doubt */}
          <Route
            path="/edit-doubt/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditDoubt />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Login */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
