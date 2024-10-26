const Category = require("../models/Category");

module.exports = {
  create: async (data) => {
    try {
      const result = await Category.create(data);

      return result;
    } catch (error) {
      return null;
    }
  },
  find: async (query) => {
    try {
      const result = await Category.findOne(query);

      return result;
    } catch (error) {
      return null;
    }
  },
  finds: async (
    query,
    filter = {},
    startIndex = null,
    limit = null,
    sort = {}
  ) => {
    try {
      const result = await Category.find(query, filter)
        .skip(startIndex)
        .limit(limit)
        .sort(sort);

      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  update: async (query, updateData) => {
    try {
      const result = await Category.findOneAndUpdate(query, updateData, {
        new: true,
      });

      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  deleteOne: async (query) => {
    try {
      const result = await Category.deleteOne(query);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  deleteMany: async (query) => {
    try {
      const result = await Category.deleteMany(query);
      console.log("delete item :", result);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  totalCount: async (query) => {
    try {
      const result = await Category.find(query).count();

      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};
