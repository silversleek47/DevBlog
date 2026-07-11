import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: 10,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Cached AI summary — generated on demand, persisted so we never
    // pay for (or wait on) the AI call more than once per post.
    summary: {
      type: String,
      default: null,
    },
    summaryGeneratedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
