import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderRole: {
      type: String,
      enum: ['admin', 'student'],
      required: true
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true
    },
    attachment: {
      url: { type: String, default: '' },
      name: { type: String, default: '' },
      fileType: { type: String, default: '' }
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

messageSchema.index({ studentId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
