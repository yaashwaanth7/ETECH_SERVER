const multer = require("multer");

const storage = multer.memoryStorage();

const singleUpload = multer({storage}).single("file");
// const file = req.file;

module.exports = singleUpload;