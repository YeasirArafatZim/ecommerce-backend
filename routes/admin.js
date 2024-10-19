const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const adminAuthController = require("../app/controllers/admin/auth.controller");
const userManageController = require("../app/controllers/admin/user.manage.controller");
const multerMiddleware = multer().any()


// File upload folder
const UPLOADS_FOLDER = `./${process.env.UPLOADS_FOLDER ? process.env.UPLOADS_FOLDER : "storage"
  }`;
// console.log(UPLOADS_FOLDER);
// define the storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_FOLDER);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName =
      file.originalname
        .replace(fileExt, "")
        .toLowerCase()
        .split(" ")
        .join("-") +
      "-" +
      Date.now();

    cb(null, fileName + fileExt);
  },
});

const filesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${UPLOADS_FOLDER}`);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    fileName =
      "file_" +
      file.originalname
        .replace(fileExt, "")
        .toLowerCase()
        .split(" ")
        .join("-") +
      "-" +
      Date.now();

    cb(null, fileName + fileExt);
  },
});

// prepare the final multer upload object
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000, // 10MB
  },
});

router.get("/", (req, res) => {
  console.log(req.nativeRequest)
  res.send("Hello Admin!");
});

// create admin
router.post("/create", adminAuthController.createAdminHandler);
router.post("/login", adminAuthController.loginHandler);

router.get("/users", userManageController.getUsersHandler)

router.post("/cms", upload.single("banner"), userManageController.postCMSHandler)
router.get("/cms", userManageController.getCMSHandler)





module.exports = router;
