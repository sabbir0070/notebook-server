const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      trim: true,
      maxlength: [40, 'Name cannot be more than 40 characters'],
    },
    colorValue: {
      type: Number,
      required: [true, 'Please add a color value'],
    },
    icon: {
      type: String,
      default: 'folder',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique category names per user
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
