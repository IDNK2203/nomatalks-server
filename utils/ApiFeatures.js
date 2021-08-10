class ApiFeatures {
  constructor(queryString, mongooseQuery, totalBlogsFound) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
    this.totalBlogsFound = totalBlogsFound;
    // this.page = null;
  }

  filter() {
    // @1 FILTERING
    // querying the db for data that satisfy a specific data condition
    //{duration : 4, price:699}
    let queryObj = { ...this.queryString };
    const excludedFields = ["limit", "sort", "page", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // ADVANCE FLITERING
    // specifying data ranges
    // {duration:7 , price:{$gt:677}}

    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    queryObj = JSON.parse(queryObj);
    this.mongooseQuery.find(queryObj);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort;
      sortBy = sortBy.split(",").join(" ");
      this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery.sort("createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      let { fields } = this.queryString;
      fields = fields.split(",").join(" ");
      this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery.select("-__v");
    }
    return this;
  }

  paginate() {
    // @4 PAGINATION
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 3;
    const skip = (page - 1) * limit;
    this.mongooseQuery.skip(skip).limit(limit);
    this.totalPages = this.totalBlogsFound / limit;
    this.page = page;
    return this;
  }
  // we send back our page as current page and also send total pages
}

module.exports = ApiFeatures;
