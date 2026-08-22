import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    code: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    color: {
      type: String,
      default: '#4F46E5' // Indigo
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for member count
groupSchema.virtual('memberCount').get(function () {
  return this.members ? this.members.length : 0;
});

export const Group = mongoose.model('Group', groupSchema);
