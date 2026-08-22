import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    assignedGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null // null means assigned to all students
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    totalMarks: {
      type: Number,
      default: 100
    },
    attachment: {
      filename: { type: String, default: '' },
      url: { type: String, default: '' },
      fileType: { type: String, default: '' }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const Assignment = mongoose.model('Assignment', assignmentSchema);
