const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const User = require("../models/user.js"); 
const initData = require("./data.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");
    
    const anyUser = await User.findOne();
    
    if (!anyUser) {
      console.log("No users found. Please create a user first.");
      return;
    }

    await Listing.deleteMany({});
    
    // Use the actual user's ID
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: anyUser._id  // Dynamic owner ID
    }));
    
    await Listing.insertMany(initData.data);
    console.log("Data initialized with owner:", anyUser.username);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from DB");
  }
}

main();