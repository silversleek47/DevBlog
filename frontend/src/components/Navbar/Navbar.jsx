import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { logout } from '../../store/authSlice.js';
import './Navbar.css';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        DevBlog
      </Link>
      <div className="navbar-links">
        {user ? (
          <>
            <span className="navbar-username">Hi, {user.username}</span>
            <button type="button" className="navbar-button" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar-link">
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
