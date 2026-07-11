import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import api from '../../api/axios.js';
import './PostDetail.css';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const fetchPost = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const { data } = await api.get(`/posts/${id}`);
      setPost(data.post);
      setSummary(data.post.summary || null);
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Failed to load post');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setSummaryError(null);
    try {
      const { data } = await api.post(`/posts/${id}/summary`);
      setSummary(data.summary);
    } catch (err) {
      setSummaryError(err.response?.data?.message || 'Failed to generate summary');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/');
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Failed to delete post');
    }
  };

  if (isLoading) return <p className="post-detail-status">Loading post...</p>;
  if (loadError) return <p className="post-detail-status post-detail-error">{loadError}</p>;
  if (!post) return null;

  const isAuthor = user && post.author?._id === user._id;

  return (
    <article className="post-detail">
      <header className="post-detail-header">
        <h1 className="post-detail-title">{post.title}</h1>
        <p className="post-detail-meta">
          By {post.author?.username || 'Unknown'} · {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </header>

      <div className="post-detail-summary-section">
        <button
          type="button"
          className="post-detail-summary-button"
          onClick={handleGenerateSummary}
          disabled={isSummaryLoading}
        >
          {isSummaryLoading ? 'Generating...' : '✨ Generate AI Summary'}
        </button>

        {summaryError && <p className="post-detail-summary-error">{summaryError}</p>}

        {isSummaryLoading && (
          <div className="post-detail-summary-box post-detail-summary-loading">
            <span className="post-detail-spinner" aria-hidden="true" />
            Analyzing post content...
          </div>
        )}

        {!isSummaryLoading && summary && (
          <div className="post-detail-summary-box">
            <h3 className="post-detail-summary-heading">Summary</h3>
            <p className="post-detail-summary-text">{summary}</p>
          </div>
        )}
      </div>

      <div className="post-detail-content">
        {post.content.split('\n').map((paragraph, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {isAuthor && (
        <button type="button" className="post-detail-delete" onClick={handleDelete}>
          Delete Post
        </button>
      )}
    </article>
  );
}

export default PostDetail;
