const native = require("../helpers/native");
const handlers = require("../exceptions/handlers");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const {
    ObjExists,
    isEmpty,
    phoneValidation,
    emailValidation,
} = require("../validation/validationHelpers/validationHelper");
const ValidationError = require("../exceptions/ValidationError");
const { getAccessToken, getToken, getOTP } = require("../helpers/utility");
const { otpSender, captchaVerify } = require("../helpers/services/api");


const User = require("../models/User");



module.exports = {
    userSignupHandler: async (req, res) => {
        let query = {};
        try {
            const { name, phone, email, password } = req.body;
            //  @validation part
            ObjExists(['name', 'phone', 'email', 'address'], req.body);

            // const ca_result = await captchaVerify(token)
            // if (!ca_result) throw new ValidationError("Invalid Captcha")

            if (!phone) {
                throw new ValidationError("Phone Number is required");
            }

            // Exist user validation
            if (phone) {
                // if (phoneValidation(phone)) throw new ValidationError("Invalid phone number")
                query.phone = phone;
            }
            if (email) {
                // if (validateEmail(email)) throw new ValidationError("Invalid email")
                query.email = email
            }
            if (email && phone) {
                query = {
                    existence: true,
                    $or: [{ phone: phone }, { email: email }],
                    // isActivated: true
                };
            }


            query = {
                existence: true,
                $or: [{ phone: phone }, { email: email }],
                // isActivated: true
            };
            phoneValidation(phone);
            // Exist user validation
            const user = await User.findOne(query);

            console.log("user: ", user, query)



            // @Business logic part
            const otp = getOTP();
            console.log("otp", otp);
            const expireDate = new Date();
            const expireTime = parseInt(process.env.OTP_EXPIRED_AT)
            expireDate.setMinutes(expireDate.getMinutes() + expireTime);
            const saveUser = {
                name,
                phone,
                email,
                role: "user",
                otp: otp,
                otpExpireDate: expireDate,
                ...req.body

            };
            // const salt = bcrypt.genSaltSync(saltRounds);
            // const hash = bcrypt.hashSync(password, salt);
            // saveUser.password = hash;
            // if (source) {
            //     saveUser.source = source;
            // } else {
            //     saveUser.source = 1
            // }
            let result = null;
            if (user) {
                if (user.isValidated) {
                    throw new ValidationError(`Phone number or email already exists`);
                } else {
                    const { otpExpireDate } = user;
                    console.log("update... user", otpExpireDate)
                    if (otpExpireDate > new Date()) {
                        throw new ValidationError(
                            `You have already requested an OTP. Please wait for ${process.env.OTP_EXPIRED_AT} minutes and try again`
                        );
                    }

                    console.log("update data: ", saveUser)

                    result = await User.findOneAndUpdate(query, saveUser)
                }
            } else {
                console.log("create new user .....")
                const newUser = new User(saveUser);
                result = await newUser.save();
            }

            if (!result) throw new ValidationError("Something went wrong in our server. Please try again later.");

            console.log("result", result)
            // send otp
            // const sendSmsResult = await otpSender(phone, otp)
            // if (sendSmsResult) {

            //     console.log("Otp sender message------------>", sendSmsResult.message)
            // }

            native.response(
                {
                    errorLog: {},
                    message: "The user has been created",
                    data: {
                        phone: phone,
                        // result
                    },
                    meta: {},
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
                    },
                    message: error.message,
                    error,
                },
                req,
                res
            );
        }
    },
    loginHandler: async (req, res) => {
        let query = {};
        try {
            const { phone } = req.body;

            //  @validation part
            if (!phone) {
                throw new ValidationError("Phone Number is required");
            }
            phoneValidation(phone);

            query.phone = phone;

            // Exist user validation
            const user = await User.findOne(query);

            if (!user) throw new ValidationError(`Please register with your phone number first in order to continue`);
            const expireDate = new Date();
            const { otpExpireDate } = user;
            if (otpExpireDate > new Date()) {
                throw new ValidationError(
                    "You have already requested an OTP. Please wait for 3 minutes and try again"
                );
            }

            // @Business logic part
            const otp = getOTP();
            const expireTime = parseInt(process.env.OTP_EXPIRED_AT)
            expireDate.setMinutes(expireDate.getMinutes() + expireTime);

            const result = await User.findOneAndUpdate({
                phone: phone
            }, {
                otp: otp,
                otpExpireDate: expireDate
            })


            if (!result) throw new ValidationError("Something went wrong in our server. Please try again later.");

            // send otp
            const sendSmsResult = await otpSender(phone, otp)

            // console.log("Otp sender message------------>", sendSmsResult.message)

            native.response(
                {
                    errorLog: {},
                    data: {
                        message: "The user has been sent otp",
                        phone: phone,

                    },
                    meta: {},
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
                        //query: `CREATE NEW USER TO WEBSITE BLOCK`,
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

    verifyOtpHandler: async (req, res) => {

        try {
            const expireDate = new Date();
            const { phone, otp } = req.body;

            let verifyDetails = await User.findOne({
                phone: phone,
            }, {
                otp: 1,
                otpExpireDate: 1,
            });


            if (!verifyDetails)
                throw new ValidationError(
                    "Invalid Phone Number. Please check your phone number and try again"
                );

            const { _id } = verifyDetails;

            const { otpExpireDate } = verifyDetails;
            console.log("otpExpireDate", otpExpireDate, new Date(otpExpireDate) < expireDate, expireDate)
            if (new Date(otpExpireDate) < expireDate)
                throw new ValidationError("The OTP you entered has expired. Please request a new one");

            console.log(verifyDetails.otp !== otp, verifyDetails.otp, otp)
            // if (verifyDetails.otp !== otp && "2132" !== otp)
            if (verifyDetails.otp !== otp)
                throw new ValidationError(
                    "The OTP you entered is incorrect. Please try again"
                );



            // create new session
            let logAt = new Date();

            const accessToken = getAccessToken(
                {
                    _id: _id,
                    logAt,
                },
                process.env.JWT_KEY
            );

            let updateDate = {
                $addToSet: { tokens: accessToken },
                logAt,
                isValidated: true,
                otp: null,
                otpExpireDate: new Date()

            };


            const userUpdateRes = await User.findByIdAndUpdate(
                {
                    _id: _id,
                },
                updateDate, { new: true }
            );

            const { isValidated, name, image, role } = userUpdateRes;
            let responseData = {
                id: _id,
                name: name ? name : null,
                phone: phone ? phone : null,
                image: image ? image : null,
                role: role ? role : null,
                accessToken: accessToken,
                isValidated: isValidated ? isValidated : null,
            };

            native.response(
                {
                    responseCode: "LIST_LOADED",
                    errorLog: {},
                    message: "Your phone number has been verified",
                    data: {
                        user: responseData,
                    },
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
                    },
                    message: error.message,
                    error,
                },
                req,
                res
            );
        }
    },

    logoutHandler: async (req, res) => {
        console.log(req.nativeRequest);
        try {
            const JWToken = req.nativeRequest.setJWToken;
            const userId = req.nativeRequest.setUserId;

            let result = await User.findByIdAndUpdate(
                { _id: userId },
                {
                    $pull: {
                        tokens: JWToken,
                    },
                }
            );


            native.response(
                {
                    responseCode: "LIST_LOADED",
                    errorLog: {},
                    data: {
                        message: "You have been logged out",
                        // user: result,
                    },

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
                        //query: `Logout TO WEBSITE BLOCK`,
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


};
