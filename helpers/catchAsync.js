const catchAsync = (fn) => {
  return (req, res, next) => {
    // catch error and pass error into the next middleware
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
