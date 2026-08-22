import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fileUrl: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    },
    submissionLink: {
      type: String,
      default: ''
    },
    comments: {
      type: String,
      default: ''
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['submitted', 'late', 'pending'],
      default: 'submitted'
    },
    grade: {
      marks: { type: Number, default: null },
      feedback: { type: String, default: '' },
      gradedAt: { type: Date, default: null },
      gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index to prevent duplicate submissions by same student for same assignment
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const Submission = mongoose.model('Submission', submissionSchema);
