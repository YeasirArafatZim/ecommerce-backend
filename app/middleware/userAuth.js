const UnauthorizedError = require("../exceptions/UnauthorizedError");
const ValidationError = require("../exceptions/ValidationError");
const handlers = require("../exceptions/handlers");


const JWT = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  let JWToken;
  try {
    const urlContent = req.originalUrl.slice(1).split("/");


    // @validation
    // json web token verification
    if (!req.headers?.authorization) {
      throw new UnauthorizedError("Invalid JWT. Please log in again ");
    }
    JWToken = req.headers?.authorization.split(" ")[1];
    let decoded = JWT.verify(JWToken, process.env.JWT_KEY, (err, decoded) => {
      if (err) throw new UnauthorizedError("Invalid JWT. Please log in again");
      return decoded;
    });

    const user = await User.findOne({ _id: decoded._id });
    // console.log(users);
    if (!user)
      throw new UnauthorizedError(
        "User Not Found. Please create a new account."
      );


    if (!user.tokens.includes(JWToken))
      throw new UnauthorizedError(
        "Expired Authentication Token. Please log in again to obtain a new token"
      );

    // console.log(user, "userAuth");

    if (!urlContent.includes("verify")) {
      if (!(user.role === "admin")) {
        if (!user.isValidated)
          throw new ValidationError(
            "Account Verification Required. Please verify your account to continue"
          );
      }
    }


    req.nativeRequest.setUser = {
      name: user?.name,
      serialNumber: user?.serialNumber,
      email: user?.email,
      phone: user?.phone,
      role: user.role,
      _id: user._id,
    };

    req.nativeRequest.setUserId = user._id;
    req.nativeRequest.setJWToken = JWToken;

    next();
  } catch (error) {
    const data = JWT.decode(JWToken);
    try {
      if (data?._id) {
        let result = await User.findByIdAndUpdate(
          { _id: data._id },
          {
            $pull: {
              tokens: JWToken,
            },
          }
        );

      }

    } finally {
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
  }
};
