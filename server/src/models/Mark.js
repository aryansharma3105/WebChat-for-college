import mongoose from 'mongoose';

const markSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    assessmentName: {
      type: String,
      required: [true, 'Assessment name is required'],
      trim: true
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: 0
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      default: 100,
      min: 1
    },
    remarks: {
      type: String,
      default: '',
      trim: true
    },
    enteredBy: {
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

// Virtual for percentage
markSchema.virtual('percentage').get(function () {
  if (this.totalMarks && this.totalMarks > 0) {
    return Math.round((this.marksObtained / this.totalMarks) * 100);
  }
  return 0;
});

export const Mark = mongoose.model('Mark', markSchema);
