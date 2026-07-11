import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import './PostCard.css';

function PostCard({ post, currentUserId, onDelete }) {
  const isAuthor = Boolean(currentUserId) && post.author?._id === currentUserId;
  const excerpt = post.content.length > 160 ? `${post.content.slice(0, 160)}...` : post.content;

  const handleDelete = (event) => {
    // Prevent the surrounding <Link> from navigating when deleting.
    event.preventDefault();
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post._id);
    }
  };

  return (
    <article className="post-card">
      <Link to={`/post/${post._id}`} className="post-card-link">
        <h2 className="post-card-title">{post.title}</h2>
        <p className="post-card-excerpt">{excerpt}</p>
      </Link>
      <div className="post-card-footer">
        <span className="post-card-author">
          By {post.author?.username || 'Unknown'} ·{' '}
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
        {isAuthor && (
          <button type="button" className="post-card-delete" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    author: PropTypes.shape({
      _id: PropTypes.string,
      username: PropTypes.string,
    }),
  }).isRequired,
  currentUserId: PropTypes.string,
  onDelete: PropTypes.func,
};

PostCard.defaultProps = {
  currentUserId: null,
  onDelete: () => {},
};

export default PostCard;
