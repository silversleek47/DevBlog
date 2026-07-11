import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Navbar from './components/Navbar/Navbar.jsx';
import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import PostDetail from './pages/PostDetail/PostDetail.jsx';
import { fetchCurrentUser } from './store/authSlice.js';

function App() {
  const dispatch = useDispatch();
  const isInitialized = useSelector((state) => state.auth.isInitialized);

  // On first load, check the httpOnly cookie for an existing session
  // so refreshes don't silently log the user out on the client.
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (!isInitialized) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/post/:id" element={<PostDetail />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
