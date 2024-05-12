const multer = require('multer');

// Define file storage --- using multer ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname);
    }
  })

  // Specify acceptable file formats
  function fileFilter (req, file, cb) {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/webp"
    ) {
        cb(null, true);     // callback accepts file types
    } else {
        cb(null, false);    // else reject   
    }
  }

  const upload = multer({ storage, fileFilter});    // upload the file

  // File size formatter
  const fileSizeFormatter = (bytes, decimal) => {
    if (bytes === 0) {
        return "0 Bytes";
    }
    const dm = decimal || 2;
    const sizes = ["Bytes", "KB", "GB", "TB", "PB", "EB", "YB", "ZB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1000));
    return (
        parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + sizes[index]
    );
  }

  module.exports = { upload, fileSizeFormatter }