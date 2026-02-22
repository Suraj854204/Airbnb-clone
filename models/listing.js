const mongoose = require("mongoose");
const Review = require("./review.js");

const imageSchema = new mongoose.Schema({
  filename: String,
  url: String,
});

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: imageSchema, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  country: { type: String, required: true },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model("Listing", listingSchema);