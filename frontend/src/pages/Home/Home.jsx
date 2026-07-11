import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

import api from '../../api/axios.js';
import PostCard from '../../components/PostCard/PostCard.jsx';
import './Home.css';

function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [formData, setFormData] = useState({ title: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const user = useSelector((state) => state.auth.user);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const { data } = await api.get('/posts');
      setPosts(data.posts);
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setFormError(null);

    if (formData.title.trim().length === 0 || formData.content.trim().length < 10) {
      setFormError('Title is required and content must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/posts', formData);
      setPosts((prev) => [data.post, ...prev]);
      setFormData({ title: '', content: '' });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    // Optimistically-safe: only remove from state after the server confirms.
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Failed to delete post');
    }
  };

  return (
    <div className="home-page">
      {user && (
        <form className="home-create-form" onSubmit={handleCreate}>
          <h2 className="home-create-title">Create a Post</h2>
          {formError && <p className="home-form-error">{formError}</p>}
          <input
            type="text"
            name="title"
            placeholder="Post title"
            value={formData.title}
            onChange={handleChange}
            className="home-input"
          />
          <textarea
            name="content"
            placeholder="What's on your mind?"
            value={formData.content}
            onChange={handleChange}
            className="home-textarea"
            rows={4}
          />
          <button type="submit" className="home-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </button>
        </form>
      )}

      <h1 className="home-heading">Latest Posts</h1>

      {isLoading && <p className="home-status">Loading posts...</p>}
      {loadError && <p className="home-status home-status-error">{loadError}</p>}
      {!isLoading && !loadError && posts.length === 0 && (
        <p className="home-status">No posts yet. Be the first to write one!</p>
      )}

      <div className="home-post-list">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} currentUserId={user?._id} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

export default Home;
