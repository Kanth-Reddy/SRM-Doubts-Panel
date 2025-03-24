import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const location = useLocation(); // Get the current location

  // Do not render the navbar on the login page
  const showNavbar = location.pathname !== '/login';

  return (
    <div>
      {showNavbar && <Navbar />} {/* Render Navbar only if not on the login page */}
      {children}
    </div>
  );
};

export default Layout;