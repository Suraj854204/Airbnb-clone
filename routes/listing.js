const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

// ================= INDEX =================
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// ================= NEW =================
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// ================= SHOW =================
router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  
  // FIXED: Correct populate syntax
  const listing = await Listing.findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: {
        path: "author",
        model: "User"
      }
    });

  if (!listing) {
    req.flash("error", "Listing you are trying to view does not exist");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
}));

// ================= EDIT =================
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you are trying to edit does not exist");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", { listing });
}));

// ================= CREATE =================
router.post("/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    // FIXED: Create new listing with owner
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    
    req.flash("success", "New listing created successfully!");
    res.redirect("/listings");
  })
);

// ================= UPDATE =================
router.put("/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    
    // FIXED: Update listing
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
  })
);

// ================= DELETE =================
router.delete("/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    
    // FIXED: Delete listing
    await Listing.findByIdAndDelete(id);
    
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
  })
);

module.exports = router;