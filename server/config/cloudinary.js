const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

console.log('Cloudinary env loaded:', {
    cloud_name: process.env.CLOUD_NAME,
    api_key_set: !!process.env.CLOUD_API_KEY,
    api_secret_set: !!process.env.CLOUD_API_SECRET,
});

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

module.exports = cloudinary;
