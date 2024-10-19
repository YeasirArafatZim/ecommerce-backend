const express = require("express");
const router = express.Router();
const fs = require("fs");
// controller
const welcome = require("../app/controllers/welcome");
const auth = require("../app/controllers/auth");

const userController = require("../app/controllers/user/user.controller");
const adminAuthController = require("../app/controllers/admin/auth.controller");

// middleware
const userAuth = require("../app/middleware/userAuth");
const adminAuth = require("../app/middleware/adminAuth");
const userManageController = require("../app/controllers/admin/user.manage.controller");
const handlers = require("../app/exceptions/handlers");


router.get("/", welcome.welcome);

// user auth
router.post("/signup", auth.userSignupHandler);
router.post("/login", auth.loginHandler);
router.post("/otp-verify", auth.verifyOtpHandler);
router.get("/logout", userAuth, auth.logoutHandler);
// router.put("/reset-password", auth.resetPasswordHandler);

// profile
router.get("/profile", userAuth, userController.getProfileHandler);

router.post("/admin/login", adminAuthController.loginHandler);
router.use("/admin", userAuth, adminAuth, require("./admin"));

router.get("/cms", userManageController.getCMSHandler)

router.get("/show/:storage/:fileName", (req, res) => {
    try {
        console.log(req.rootDir)
        req.params.storage
        filePath = req.rootDir + `/${req.params.storage}/` + req.params.fileName;
        // fs.existsSync(filePath)
        // res.sendFile(req.rootDir + "/storage/" + req.params.fileName);

        if (fs.existsSync(filePath)) {
            res.sendFile(req.rootDir + `/${req.params.storage}/` + req.params.fileName);
        } else {

            throw new NotFoundError('File does not exist');
        }
    } catch (error) {
        console.log(error);
        console.log(error.message);
        handlers(
            {
                errorLog: {
                    location: req.originalUrl.split("/").join("::"),
                    details: `Error: ${error}`,
                },
                message: error.message,
                success: false,
                error,
            },
            req,
            res
        );

    }
});

module.exports = router;
