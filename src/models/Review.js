const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    business: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ''
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);