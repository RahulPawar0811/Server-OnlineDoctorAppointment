const multer = require("multer");
const path = require("path");
const fs = require("fs");


const storageforDoctors = multer.diskStorage({
  destination: function (req, file, cb) {
   
   
    if (file.fieldname === "profilePicture") {
      const directory = path.join(__dirname, "../uploads", "/doctors");

      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      cb(null, directory);
    }
else {
      // Handle cases where fieldname is not "multipleImages"
      return cb(new Error("Invalid fieldname for uploading files"), null);
    }
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const storageforPatients = multer.diskStorage({
  destination: function (req, file, cb) {
   
   
    if (file.fieldname === "profilePicture") {
      const directory = path.join(__dirname, "../uploads", "/patients");

      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      cb(null, directory);
    }
else {
      // Handle cases where fieldname is not "multipleImages"
      return cb(new Error("Invalid fieldname for uploading files"), null);
    }
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const storageforPrescriptions = multer.diskStorage({
  destination: function (req, file, cb) {
   
   
    if (file.fieldname === "prescription_pdf") {
      const directory = path.join(__dirname, "../uploads", "/prescriptions");

      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      cb(null, directory);
    }
else {
      // Handle cases where fieldname is not "multipleImages"
      return cb(new Error("Invalid fieldname for uploading files"), null);
    }
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const uploadDoctors = multer ({storage: storageforDoctors});
const uploadPatients = multer({storage: storageforPatients});
const uploadPrescriptions = multer({storage:storageforPrescriptions });

module.exports = { uploadDoctors,uploadPatients,uploadPrescriptions};