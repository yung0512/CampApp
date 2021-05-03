const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const campgrounds = require("../controllers/campgrounds");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary"); //the cloudinary storage config and else
const upload = multer({ storage }); //tell multer to store image in cloudinary
router
  .route("/")
  .get(catchAsync(campgrounds.index)) //show all campground
  .post(
    //create new campground
    isLoggedIn,
    upload.array("image"), //a little bug,upload file then validate
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );
router.get("/new", isLoggedIn, campgrounds.renderNewForm); //need to add this section before the /campground/:id route
router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampgrounds))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground, //use function as middleware
    catchAsync(campgrounds.updateCampground)
  );
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
