import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group ID is required'],
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required']
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
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

groupMessageSchema.index({ groupId: 1, createdAt: 1 });

export const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);
