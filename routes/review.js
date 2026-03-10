const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

const reviewController = require("../controllers/review");


// ================= CREATE REVIEW =================
router.post("/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);


// ================= DELETE REVIEW =================
router.delete("/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;