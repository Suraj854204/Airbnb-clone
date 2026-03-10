const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");

const listingController = require("../controllers/listing");

// Multer + Cloudinary config
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });


// ================= INDEX =================
router.get("/", wrapAsync(listingController.index));


// ================= NEW =================
router.get("/new",
  isLoggedIn,
  listingController.renderNewForm
);


// ================= SHOW =================
router.get("/:id",
  wrapAsync(listingController.showListing)
);


// ================= CREATE =================
router.post("/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing)
);


// ================= EDIT =================
router.get("/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);


// ================= UPDATE =================
router.put("/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing)
);


// ================= DELETE =================
router.delete("/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing)
);

module.exports = router;