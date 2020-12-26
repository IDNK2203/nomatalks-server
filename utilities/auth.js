let authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("error_msg", "you have to log in to view this resource");
    res.redirect("/auth/login");
  }
};
let adminCheck = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin) {
    next();
  } else {
    res.send(
      "<h1>You are not Authorized to view this resource <a href='/protected-route'>view the resource instead</a></h1>"
    );
  }
};

module.exports = {
  authCheck,
  adminCheck,
};
