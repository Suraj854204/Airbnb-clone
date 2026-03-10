require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary automatically parses CLOUDINARY_URL
cloudinary.config({
  secure: true
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "wanderlust_DEV",
    allowed_formats: ["jpg","jpeg","png"]
  }
});

module.exports = { cloudinary, storage };