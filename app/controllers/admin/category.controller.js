const fs = require("fs");
const handlers = require("../../exceptions/handlers");
const native = require("../../helpers/native");

// model
const categoryDB = require("../../services/categoryDB");

const createCategory = async (req, res) => {
  try {
    req.body = Object.assign({}, req.body);
    if (req.file) {
      let fileUrl = req.file.path.split("\\").join("/");
      imageUrl = `${process.env.BASE_URL}/api/v1/show/${fileUrl}`;
      req.body.banner = imageUrl;
    }
    let response = null;

    response = await categoryDB.create({
      ...req.body,
      createdBy: req.nativeRequest.setUserId,
    });

    // Adding subcategory into parent
    if (req.body.parentCategory) {
      categoryDB.update(
        { _id: req.body.parentCategory },
        { subCategories: req.body.parentCategory }
      );
    }

    if (!response) throw new Error("Something went wrong");

    native.response(
      {
        errorLog: {},
        data: response,
        message: "Category created successfully",
        meta: {},
        status: 200,
      },
      req,
      res
    );
  } catch (error) {
    console.log(error);
    try {
      if (req.file) {
        let fileUrl = req.file.path.split("\\").join("/");
        let imagePath = req.rootDir + "/" + fileUrl;
        console.log(imagePath);
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
};

// Recursive function to fetch category hierarchy
const getCategoryHierarchy = async (categoryId) => {
  const category = await categoryDB.find(categoryId);

  // Fetch subcategories recursively
  const subCategories = await categoryDB.finds({ parentCategory: categoryId });
  const subCategoriesWithChildren = await Promise.all(
    subCategories.map(async (subCategory) => {
      const subCategoryWithChildren = await getCategoryHierarchy(
        subCategory._id
      );
      return subCategoryWithChildren;
    })
  );

  return {
    _id: category._id,
    name: category.name,
    description: category.description,
    banner: category.banner,
    products: category.products,
    subCategories: subCategoriesWithChildren,
  };
};

// Route handler for fetching the category hierarchy
const getCategoryTree = async (req, res) => {
  try {
    // Start from the top-level categories (parentCategory: null)
    const rootCategories = await categoryDB.finds({ parentCategory: null });

    // Get each root category with its full hierarchy
    const categoryTree = await Promise.all(
      rootCategories.map((rootCategory) =>
        getCategoryHierarchy(rootCategory._id)
      )
    );

    native.response(
      {
        errorLog: {},
        data: categoryTree,
        message: "Fetched category tree successfully",
        meta: {},
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
        },
        message: error.message,
        success: false,
        error,
      },
      req,
      res
    );
  }
};

module.exports = {
  createCategory,
  getCategoryTree,
};
