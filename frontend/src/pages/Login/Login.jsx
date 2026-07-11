import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { login, signup, clearAuthError } from '../../store/authSlice.js';
import './Login.css';

function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const isLoading = status === 'loading';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMode = () => {
    dispatch(clearAuthError());
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const thunk =
      mode === 'login'
        ? login({ email: formData.email, password: formData.password })
        : signup(formData);

    const resultAction = await dispatch(thunk);

    if (resultAction.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">{mode === 'login' ? 'Log In' : 'Create an Account'}</h1>

        {error && <p className="login-error">{error}</p>}

        {mode === 'signup' && (
          <div className="login-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              autoComplete="username"
            />
          </div>
        )}

        <div className="login-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        <button type="submit" className="login-submit" disabled={isLoading}>
          {isLoading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Sign Up'}
        </button>

        <button type="button" className="login-toggle" onClick={toggleMode}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </form>
    </div>
  );
}

export default Login;
