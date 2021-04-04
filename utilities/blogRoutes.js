const Category = require("../models/category");
const BlogPost = require("../models/blogPost");
const { query } = require("express-validator");
const blogsPerPage = 9;

// public data
const blogsQueryChain = (query, req) => {
  const page = req.params.page || 1; // Page
  return query
    .sort({ createdAt: -1 })
    .populate("user")
    .skip(blogsPerPage * page - blogsPerPage)
    .limit(blogsPerPage)
    .where("status")
    .equals("public");
};

// public data
const blogQueryChain = (query, related = false) => {
  return query.populate("user").where("status").equals("public").limit(3);
};

const getCategories = (status) => {
  return Category.find().where("status").equals(status);
};

let getPageData = async (req, totalBlogsFound) => {
  const navCategories = await getCategories("primary");
  const subNavCategories = await getCategories("secondary");
  const totalPages = Math.ceil(totalBlogsFound / blogsPerPage);
  const mostRecentBlogs = await BlogPost.find({})
    .sort({ createdAt: -1 })
    .limit(blogsPerPage / 3)
    .where("status")
    .equals("public");
  let obj = {
    searchOpts: req.query,
    currentPage: req.params.page || 1,
    totalPages,
    navCategories,
    subNavCategories,
    mostRecentBlogs,
  };
  return obj;
};
let getSinglePageData = async (req) => {
  const navCategories = await getCategories("primary");
  const subNavCategories = await getCategories("secondary");
  let obj = {
    navCategories,
    searchOpts: req.query,
    subNavCategories,
  };
  return obj;
};

module.exports = {
  blogsQueryChain,
  getCategories,
  getPageData,
  blogQueryChain,
  getSinglePageData,
};
