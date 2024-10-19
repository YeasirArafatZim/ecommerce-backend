const response = async (v, req, res) => {
  // console.log("V", v);
  console.log("request api endpoint: ", req.originalUrl, " ==> response time ", new Date().toLocaleString())

  try {
    responseHelper(
      {
        errorLog: v.errorLog,
        data: v.data,
        meta: v.meta,
        message: v.message,
        success: v.success
      },
      v?.status,
      res
    );
  } catch (error) {
    // @todo
    responseHelper(
      {
        errorLog: v.errorLog,
        data: v.data,
        meta: v.meta,
        message: v.message,
        success: v.success
      },
      v?.status,
      res
    );
  }
};

const responseHelper = (v, status, res) => {
  let response = {
    resState: status,
    success: v.success,
    message: v.message
  };
  if (v?.errorLog?.location) {
    response.errorLog = v.errorLog;
  } else {
    response.data = v.data;
    response.meta = v.meta;
  }
  res.status(status).json(response);
};

exports.response = response;
