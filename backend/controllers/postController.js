import mongoose from 'mongoose';
import Post from '../models/Post.js';

const MOCK_AI_DELAY_MS = 1500;

/**
 * Stand-in for a real AI SDK call (Anthropic/OpenAI/etc). Swap the body of
 * this function for a real API call when ready — nothing in generateSummary
 * below needs to change, since the caching/persistence logic is decoupled
 * from how the summary text is produced.
 */
const generateMockSummary = async (content) => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_AI_DELAY_MS));
  const trimmed = content.replace(/\s+/g, ' ').trim();
  const excerpt = trimmed.length > 220 ? `${trimmed.slice(0, 220)}...` : trimmed;
  return `AI Summary: ${excerpt}`;
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ posts });
  } catch (err) {
    console.error('getAllPosts error:', err.message);
    return res.status(500).json({ message: 'Server error fetching posts' });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const post = await Post.findById(id).populate('author', 'username email');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json({ post });
  } catch (err) {
    console.error('getPostById error:', err.message);
    return res.status(500).json({ message: 'Server error fetching post' });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await Post.create({
      title,
      content,
      author: req.user._id,
    });

    const populatedPost = await post.populate('author', 'username email');

    return res.status(201).json({ post: populatedPost });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('createPost error:', err.message);
    return res.status(500).json({ message: 'Server error creating post' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }

    await post.deleteOne();

    return res.status(200).json({ message: 'Post deleted successfully', postId: id });
  } catch (err) {
    console.error('deletePost error:', err.message);
    return res.status(500).json({ message: 'Server error deleting post' });
  }
};

export const generateSummary = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Cache hit — never re-call the AI service for the same post.
    if (post.summary) {
      return res.status(200).json({ summary: post.summary, cached: true });
    }

    const summary = await generateMockSummary(post.content);

    post.summary = summary;
    post.summaryGeneratedAt = new Date();
    await post.save();

    return res.status(200).json({ summary, cached: false });
  } catch (err) {
    console.error('generateSummary error:', err.message);
    return res.status(500).json({ message: 'Server error generating summary' });
  }
};
