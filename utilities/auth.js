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
    req.flash("error_msg", "You are not authorized to view this resource");
    res.redirect("/magazine");
  }
};

let regValidation = async (req, res, error, next) => {
  const { name, password, email, password2 } = req.body;
  // handle form validation
  if (!name || !email || !password || !password2) {
    error.push({ msg: "fill all input fields" });
  }
  if (password !== password2) {
    error.push({ msg: "passwords do not match" });
  }
  if (password.length < 3) {
    error.push({ msg: "password should be at least 6 characters" });
  }
  if (error.length > 0) {
    res.render("register", {
      name,
      email,
      password,
      password2,
      valError: error,
      layout: "layouts/auth",
    });
    return false;
  } else {
    return true;
  }
};

module.exports = {
  authCheck,
  adminCheck,
  regValidation,
};
