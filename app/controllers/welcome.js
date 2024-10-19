const { application } = require("express");
const handlers = require("../exceptions/handlers");
const native = require("../helpers/native");

module.exports = {
  welcome: async (req, res) => {
    try {
      native.response(
        {
          errorLog: {},
          data: {
            type: "ECommerce",
          },
          meta: {
            count: 0,
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
