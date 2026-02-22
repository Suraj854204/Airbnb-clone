const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.js");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);
    
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust!");
      
      
      const redirectUrl = req.session.redirectUrl || "/listings";
      delete req.session.redirectUrl; 
      res.redirect(redirectUrl);
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post("/login", 
  saveRedirectUrl, 
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
  }), 
  (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }
);
     //next parameter add to handles errors during login process
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err); 
    }
    req.flash("success", "You have been logged out");
    
    res.redirect("/listings");
  });
});

module.exports = router;