const CMS = require("../models/CMS")


module.exports = {
    create: async (data) => {
        try {
            const result = await CMS.create(data);

            return result;
        } catch (error) {
            return null;
        }
    },
    find: async (query) => {
        try {
            const result = await CMS.findOne(query);

            return result;
        } catch (error) {
            return null;
        }
    },
    finds: async (query, filter = {}, startIndex = null, limit = null, sort = {}) => {
        try {
            const result = await CMS.find(query, filter).skip(startIndex).limit(limit).sort(sort);

            return result;
        } catch (error) {
            console.log(error)
            return null;
        }
    },
    update: async (query, updateData) => {
        try {
            const result = await CMS.findOneAndUpdate(
                query,
                updateData,
                { new: true }
            );

            return result
        } catch (error) {
            console.log(error)
            return null
        }
    },
    deleteOne: async (query) => {
        try {
            const result = await CMS.deleteOne(query);
            return result
        } catch (error) {
            console.log(error)
            return null
        }
    },

    deleteMany: async (query) => {
        try {
            const result = await CMS.deleteMany(query);
            console.log("delete item :", result)
            return result
        } catch (error) {
            console.log(error)
            return null
        }
    },
    totalCount: async (query) => {
        try {
            const result = await CMS.find(query).count();

            return result;
        } catch (error) {
            console.log(error)
            return null;
        }
    },

}