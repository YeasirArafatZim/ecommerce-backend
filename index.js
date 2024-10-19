const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();
const port = process.env.PORT || 5000;

app.use((req, res, next) => {
  req.nativeRequest = {};
  req.nativeRequest.requestTime = new Date();
  next();
});
app.use(
  express.json({
    limit: "500mb",
  })
);
app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb",
  })
);

app.use((req, res, next) => {
  req.rootDir = __dirname;
  next();
});

//database connection with mongoose
mongoose.set("strictQuery", true);
let dbURL = `${process.env.DB_URL}`;
console.log(dbURL);
mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("MongoDB connect success"));

app.use("/api/v1", require("./routes/api"));
app.get("/", (req, res) => {
  res.send("<h1 style='text-align: center'>Welcome to E-Commerce Backend</h1>");
});

const handlers = require("./app/exceptions/handlers");
const NotFoundError = require("./app/exceptions/NotFountError");

app.use((req, res, next) => {
  const error = new NotFoundError("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
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
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

// app.listen(port, "172.16.10.119", () => {
//   console.log(`listening on port ${port}`);
// });
