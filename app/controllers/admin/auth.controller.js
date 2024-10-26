const bcrypt = require("bcrypt");
const saltRounds = 10;

const handlers = require("../../exceptions/handlers");
const native = require("../../helpers/native");
const { isEmpty, ObjExists } = require("../../validation/validationHelpers/validationHelper");
const ValidationError = require("../../exceptions/ValidationError");
const { getAccessToken } = require("../../helpers/utility");
const UnauthorizedError = require("../../exceptions/UnauthorizedError");



// model
const User = require("../../models/User");



module.exports = {
    createAdminHandler: async (req, res) => {
        let query = {};
        try {  
            const { email, password, name, phone } = req.body;

            //  @validation part
            isEmpty(req.body);
            ObjExists(["name", "password", "phone", "email"], req.body);

            if (!email) {
                if (!phone) {
                    throw new ValidationError("Email and Phone Number are required");
                }
                throw new ValidationError("Email is required");
            } else {
                if (!phone) {
                    throw new ValidationError("Phone Number is required");
                }
                query.phone = phone;
                query.email = email;
                if (phone) {
                    query = {
                        $or: [{ phone: phone }, { email: email }],
                    };
                }
            }

            // Exist user validation
            const user = await User.findOne(query);

            if (user) {
                if (user.phone === phone && user.email === email)
                    throw new ValidationError(`Email and Phone Number Already exist`);
                else if (user.phone === phone)
                    throw new ValidationError(`Phone Number already exists`);
                else {
                    throw new ValidationError(`Email already exists`);
                }
            }

            // @Business logic part

            // create admin
            const saveUser = {
                email,
                name,
                phone,
                role: "admin",
                isValidated: true,
            };
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(password, salt);
            saveUser.password = hash;

            console.log(password)

            const newUser = new User(saveUser);
            const result = await newUser.save();
            if (!result) throw new ValidationError("Something went wrong in our server. Please try again later.");


            native.response(
                {
                    errorLog: {},
                    data: {
                        message: "The admin has been created",
                        result
                    },
                    meta: {
                        count: 1
                    },
                    status: 201,
                },
                req,
                res
            );
        } catch (error) {
            console.log(error);
            handlers(
                {
                    errorLog: {
                        location: req.originalUrl.split("/").join("::"),
                        details: `Error: ${error}`,
                        message: error.message,
                    },
                    error,
                },
                req,
                res
            );
        }
    },
    loginHandler: async (req, res) => {
        let query = { status: true };
        try {
            const { userName, password, isPhone } = req.body;
            ObjExists(["userName", "password"], req.body);
            query = {
                status: true,
                $or: [{ phone: userName }, { email: userName }],
            };

            console.log(query)
            // @validation part
            const user = await User.findOne(query);

            console.log("user--------------------------->", user)
            if (!user)
                throw new UnauthorizedError("Your credentials are incorrect");


            const { name, role, _id } = user;
            if (!bcrypt.compareSync(password, user.password)) {
                throw new UnauthorizedError("Your credentials are incorrect");
            }

            // create new session
            let logAt = new Date();

            const accessToken = getAccessToken(
                {
                    _id,
                    name,
                    role,
                    logAt,
                },
                process.env.JWT_KEY
            );

            let updateDate = {
                $addToSet: { tokens: accessToken },
                logAt,
            };


            const userUpdateRes = await User.findByIdAndUpdate(
                {
                    _id: _id,
                },
                updateDate
            );

            const { isValidated } = userUpdateRes;
            let responseData = {
                id: _id,
                name,
                email: userUpdateRes.email ? userUpdateRes.email : null,
                phone: userUpdateRes.phone ? userUpdateRes.phone : null,
                image: user?.image ? user.image : null,
                role: role,
                accessToken: accessToken,
                isValidated,
            };


            native.response(
                {
                    responseCode: "LIST_LOADED",
                    errorLog: {},
                    data: responseData,
                    status: 200,
                },
                req,
                res
            );
        } catch (error) {
            console.log(error);
            handlers(
                {
                    errorLog: {
                        location: req.originalUrl.split("/").join("::"),
                        details: `Error: ${error}`,
                        message: error.message,
                    },
                    error,
                },
                req,
                res
            );
        }
    },
}