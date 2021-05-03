const User = require("../models/user");
module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};
module.exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username, password });
    const registerUser = await User.register(user, password); //the passport-mogoose method
    req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }
    });
    req.flash("success", "Welcome to Yelp Camp");
    res.redirect("/campgrounds");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};
module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};
module.exports.login = (req, res) => {
  req.flash("success", "welcome back!");
  const redirectUrl = req.session.returnTo || "campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};
module.exports.logout = (req, res) => {
  req.logout();
  console.log("logout!", req.user);
  req.flash("success", "Goodbye");
  res.redirect("/campgrounds");
};
