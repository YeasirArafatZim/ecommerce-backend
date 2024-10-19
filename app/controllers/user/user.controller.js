const native = require("../../helpers/native");
const handlers = require("../../exceptions/handlers");


// model
const User = require("../../models/User");

module.exports = {
    getProfileHandler: async (req, res) => {
        const { setUserId } = req.nativeRequest;
        try {
            const user = await User.findOne({ _id: setUserId })
         
            // user details
            const { _id, name, image, phone, role, username, email } = user;
            let resData = {
                id: _id,
                name: name ? name : null,
                username: username ? username : null,
                email: email ? email : null,
                image: image ? image : null,
                phone: phone ? phone : null,
                role: role ? role : null,
                matchCount: matchCount ? matchCount : 0,
                weekly: {
                    score: 0,
                    time: null,
                    date: null
                }

            }


            native.response(
                {
                    errorLog: {},
                    data: resData,
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
 
}
