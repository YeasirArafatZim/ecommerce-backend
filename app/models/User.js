const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const field = {
  name: {
    type: String,
    default: null,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  consentMessage: {
    type: Boolean,
  },
  tokens: [{ type: String }],
  logAt: {
    type: Date,
  },
  role: {
    // admin user
    type: String,
    enum: {
      values: ["admin", "user"],
      message: "User role value can't be {VALUE}, must be admin / user",
    },
  },

  otp: {
    type: String,
  },
  otpAt: {
    type: Date,
  },
  otpExpireDate: {
    type: Date,
  },
  isValidated: {
    type: Boolean,
    default: false,
  },

  // common field
  status: {
    // true or false
    type: Boolean,
    default: true,
  },
  existence: {
    // true and false
    type: Boolean,
    default: true,
  },
};

const appUserSchema = mongoose.Schema(field, { timestamps: true });

appUserSchema.plugin(AutoIncrement, { inc_field: "serialNumber" });

module.exports = mongoose.model("User", appUserSchema);
