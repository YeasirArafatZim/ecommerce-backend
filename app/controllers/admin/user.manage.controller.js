const fs = require("fs");
const handlers = require("../../exceptions/handlers");
const native = require("../../helpers/native");
const { parse } = require('json2csv');

// model
const User = require("../../models/User");
const cmsDB = require("../../services/cmsDB");


module.exports = {
    getUsersHandler: async (req, res) => {
        let startIndex = 0;
        let query = {
            phone: { $ne: '' },
            role: { $ne: 'admin' },
            existence: { $ne: false },
            isValidated: true
        };
        let page = req.query.page;
        let limit = req.query.limit;
        let searchValue = req.query.searchValue;


        try {
            if (!limit) limit = 150;
            if (!page) page = 1;


            limit = parseInt(limit);
            page = parseInt(page);

            page = page - 1;
            startIndex = page * limit;
            if (searchValue) {
                console.log(searchValue)
                query = {
                    role: { $ne: 'admin' },
                    existence: { $ne: false },
                    isValidated: true,
                    $or: [
                        { name: { $regex: searchValue, $options: "i" } },
                        { phone: { $regex: searchValue, $options: "i" } },
                    ]
                };
            }

            console.log(query);

            const totalCount = await User.find(query).count();
            const users = await User.find(query, {
                password: 0,
                tokens: 0,

            }).skip(startIndex).limit(limit);

            console.log(users);
            const resData = [];
            for (let user of users) {
                const { _id, name, email, address, phone, createdAt } = user;
                resData.push({
                    userId: _id,
                    name: name ? name : null,
                    email: email ? email : null,
                    address: address ? address : null,
                    phone: phone,
                    regAt: createdAt,
                })
            }


            native.response({
                errorLog: {},
                message: "Users fetched successfully",
                data: resData,
                meta: {
                    count: users.length,
                    totalCount,
                },
                status: 200
            }, req, res);
        } catch (error) {
            console.log(error)
            handlers(
                {
                    errorLog: {
                        location: req.originalUrl.split("/").join("::"),
                        details: `Error: ${error}`,
                        message: error.message,
                    },
                    error,

                }, req, res)
        }

    },

    postCMSHandler: async (req, res) => {
        try {
            req.body = Object.assign({}, req.body);
            if (req.file) {
                let fileUrl = req.file.path.split("\\").join("/");
                imageUrl = `${process.env.BASE_URL}/api/v1/show/${fileUrl}`;
                req.body.banner = imageUrl;
            }
            let response = null
            const cms = await cmsDB.find({ status: true, existence: true })
            if (cms) {
                response = await cmsDB.update({ _id: cms._id }, req.body)
            } else {

                response = await cmsDB.create({ ...req.body, createdBy: req.nativeRequest.setUserId })

            }
            if (!response) throw new Error("Something went wrong")

            native.response({
                errorLog: {},
                data: response,
                message: "CMS updated successfully",
                meta: {},
                status: 200
            }, req, res);
        } catch (error) {
            console.log(error)
            try {
                if (req.file) {
                    let fileUrl = req.file.path.split("\\").join("/");
                    let imagePath = req.rootDir + "/" + fileUrl;
                    console.log(imagePath)
                    fs.unlinkSync(imagePath);
                }

            } catch (error) {
                console.log(error);
            } finally {
                handlers(
                    {
                        errorLog: {
                            location: req.originalUrl.split("/").join("::"),
                            details: `Error: ${error}`,
                        },
                        message: error.message,
                        success: false,
                        error,
                    },
                    req,
                    res
                );
            }
        }
    },
    getCMSHandler: async (req, res) => {
        try {
            const cms = await cmsDB.find({ status: true, existence: true })
            const totalUser = await User.find({ existence: true, isValidated: true }).count();
           
            native.response({
                errorLog: {},
                data: cms,
                message: "CMS fetched successfully",
                meta: {
                    totalUser: totalUser + (cms?.manualUser ? cms.manualUser: 0)
                },
                status: 200
            }, req, res);
        } catch (error) {
            console.log(error)
            handlers(
                {
                    errorLog: {
                        location: req.originalUrl.split("/").join("::"),
                        details: `Error: ${error}`,
                    },
                    message: error.message,
                    success: false,
                    error,
                },
                req,
                res
            );
        }
    }

}