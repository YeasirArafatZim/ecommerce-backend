const UnauthorizedError = require("../exceptions/UnauthorizedError");
const handlers = require("../exceptions/handlers");

module.exports = async (req, res, next) => {
  try {
    const { setUser } = req.nativeRequest;
    if (setUser.role !== "admin")
      throw new UnauthorizedError("Admin Access Only.");

    next();
  } catch (error) {
    console.log(error);
    handlers(
      {
        errorLog: {
          location: req.originalUrl.slice(1).split("/").join("::"),
          //query: "SYSTEM ADMIN  AUTH MIDDLEWARE",
          details: `Error: ${error}`,
        },
        error,
      },
      req,
      res
    );
  }
};
