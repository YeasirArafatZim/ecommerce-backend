const mongoose = require("mongoose");

const field = {

    banner: {
        type: String
    },
    description: {
        type: String,
    },
    manualUser:{
        type: Number,
        default: 0
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
    createdBy: {
        // @relation
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    updatedBy: {
        // @relation
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
  
};

const appCMSSchema = mongoose.Schema(field, { timestamps: true });

module.exports = mongoose.model("CMS", appCMSSchema);
