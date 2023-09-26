const multer = require('multer');

//configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/images'); // Destination directory for uploaded files
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname); // File naming strategy
    },
  });
  
  const upload = multer({ storage: storage });

  module.exports = upload;



